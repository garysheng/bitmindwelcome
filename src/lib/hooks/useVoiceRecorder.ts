'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

enum VoiceState {
  IDLE = 'idle',
  WARMING_UP = 'warming_up', 
  RECORDING = 'recording',
  PROCESSING = 'processing'
}

// Initialize MediaRecorder dynamically on the client side
let isEncoderRegistered = false
let currentMimeType = 'audio/wav'

const isSafari = () => {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('safari') && !ua.includes('chrome')
}

// Add type declarations for the WAV encoder modules
declare module 'extendable-media-recorder' {
  export class ExtendableMediaRecorder {
    constructor(stream: MediaStream, options?: MediaRecorderOptions)
    start(timeslice?: number): void
    stop(): void
    state: 'inactive' | 'recording' | 'paused'
    ondataavailable: (event: BlobEvent) => void
    onstop: () => void
    onerror: (event: { error: Error }) => void
  }
}

declare module 'extendable-media-recorder-wav-encoder' {
  export function connectWavEncoder(): Promise<void>
}

interface BlobEvent {
  data: Blob
  timecode?: number
}

const initMediaRecorder = async (stream: MediaStream): Promise<MediaRecorder> => {
  if (typeof window === 'undefined') throw new Error('Cannot initialize MediaRecorder server-side')

  try {
    console.log('Initializing MediaRecorder with stream:', {
      active: stream.active,
      tracks: stream.getTracks().length
    })

    // Special handling for Safari
    if (isSafari()) {
      console.log('Safari detected, using m4a configuration')
      currentMimeType = 'audio/mp4'
      return new window.MediaRecorder(stream)
    }

    // For other browsers, prefer formats compatible with Deepgram
    if (typeof window.MediaRecorder !== 'undefined') {
      const formats = [
        'audio/webm',  // Most compatible format
        'audio/ogg',   // Good fallback
        'audio/mp4',   // For Safari
        'audio/wav'    // Last resort
      ]

      for (const format of formats) {
        if (window.MediaRecorder.isTypeSupported(format)) {
          try {
            currentMimeType = format
            console.log('Using format:', format)
            return new window.MediaRecorder(stream, { mimeType: format })
          } catch (e) {
            console.warn(`Failed to initialize with ${format}:`, e)
          }
        }
      }
    }

    // If no native format worked, fall back to WAV
    console.log('Falling back to WAV format...')
    const [{ ExtendableMediaRecorder }, { connectWavEncoder }] = await Promise.all([
      import('extendable-media-recorder'),
      import('extendable-media-recorder-wav-encoder')
    ])

    if (!isEncoderRegistered) {
      console.log('Registering WAV encoder...')
      await connectWavEncoder()
      isEncoderRegistered = true
      console.log('WAV encoder registered')
    }

    currentMimeType = 'audio/wav'
    return new ExtendableMediaRecorder(stream, { mimeType: 'audio/wav' }) as unknown as MediaRecorder

  } catch (e) {
    console.error('Failed to initialize MediaRecorder:', e)
    throw new Error('Failed to initialize recording. Please try using a modern browser like Chrome or Safari.')
  }
}

interface UseVoiceRecorderProps {
  onRecordingComplete: (blob: Blob, mimeType: string) => Promise<void>
  onError: (error: Error) => void
}

export function useVoiceRecorder({
  onRecordingComplete,
  onError
}: UseVoiceRecorderProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>(VoiceState.IDLE)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const stopTimeout = useRef<NodeJS.Timeout | null>(null)
  const warmupTimeout = useRef<NodeJS.Timeout | null>(null)

  // Clean up audio resources
  const cleanupAudio = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (stopTimeout.current) {
      clearTimeout(stopTimeout.current)
      stopTimeout.current = null
    }
    if (warmupTimeout.current) {
      clearTimeout(warmupTimeout.current)
      warmupTimeout.current = null
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    setVoiceState(VoiceState.PROCESSING)
    
    // Clear any existing timeout
    if (stopTimeout.current) {
      clearTimeout(stopTimeout.current)
    }
    
    // Set new timeout to actually stop recording in 1 second
    stopTimeout.current = setTimeout(() => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      stopTimeout.current = null
    }, 1000)
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // First check if we can get a media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16
        }
      })

      console.log('Got media stream:', stream)
      mediaStreamRef.current = stream
      
      console.log('Initializing MediaRecorder...')
      const recorder = await initMediaRecorder(stream)
      mediaRecorder.current = recorder

      const audioChunks: Blob[] = []

      recorder.ondataavailable = (event: BlobEvent) => {
        console.log('Data available:', event.data.size)
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: currentMimeType })
          console.log('Created audio blob:', audioBlob.size, 'with type:', currentMimeType)
          await onRecordingComplete(audioBlob, currentMimeType)
        } catch (error) {
          console.error('Error processing audio:', error)
          onError(error as Error)
        } finally {
          setVoiceState(VoiceState.IDLE)
        }
      }

      // Start recording immediately
      recorder.start(1000) // Collect data every second
      
      // Show warming up state but don't delay recording
      setVoiceState(VoiceState.WARMING_UP)
      warmupTimeout.current = setTimeout(() => {
        setVoiceState(VoiceState.RECORDING)
        warmupTimeout.current = null
      }, 1000)

      // Set 2-minute timeout for recording
      stopTimeout.current = setTimeout(() => {
        stopRecording()
        onError(new Error('Recording time limit reached (2 minutes)'))
      }, 120000)

    } catch (error) {
      console.error('Error starting voice recording:', error)
      onError(error as Error)
      setVoiceState(VoiceState.IDLE)
    }
  }, [onRecordingComplete, onError, stopRecording])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [cleanupAudio])

  return {
    isRecording: voiceState === VoiceState.RECORDING,
    isWarmingUp: voiceState === VoiceState.WARMING_UP,
    isProcessing: voiceState === VoiceState.PROCESSING,
    startRecording,
    stopRecording
  }
} 