'use client'

import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder'
import { Button } from './button'
import { Mic, Square, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, mimeType: string) => Promise<void>
  onError: (error: Error) => void
  disabled?: boolean
}

export function VoiceRecorder({
  onRecordingComplete,
  onError,
  disabled = false
}: VoiceRecorderProps) {
  const {
    isRecording,
    isWarmingUp,
    isProcessing,
    startRecording,
    stopRecording
  } = useVoiceRecorder({
    onRecordingComplete,
    onError
  })

  return (
    <div className="flex justify-center gap-2">
      {!isRecording && !isProcessing ? (
        <Button
          onClick={startRecording}
          disabled={disabled || isWarmingUp}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isWarmingUp ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          disabled={disabled}
          variant="destructive"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Square className="h-6 w-6" />
          )}
        </Button>
      )}
    </div>
  )
} 