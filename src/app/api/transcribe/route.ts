import { NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('Missing DEEPGRAM_API_KEY environment variable')
}

// Map of supported mime types to Deepgram encoding
const MIME_TYPE_TO_ENCODING: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3'
}

export async function POST(request: Request) {
  try {
    // Get the audio file from the request
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const mimeType = formData.get('mimeType') as string
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate mime type
    const encoding = MIME_TYPE_TO_ENCODING[mimeType]
    if (!encoding) {
      return NextResponse.json(
        { error: `Unsupported audio format: ${mimeType}. Supported formats are: ${Object.keys(MIME_TYPE_TO_ENCODING).join(', ')}` },
        { status: 400 }
      )
    }

    console.log('Received audio file:', {
      type: mimeType,
      encoding,
      size: audioFile.size,
      name: audioFile.name
    })

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Making request to Deepgram API...')

    // Make direct API call to Deepgram
    const response = await fetch(`https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&punctuate=true&mimetype=${mimeType}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': mimeType
      },
      body: buffer
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Deepgram API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Deepgram API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Deepgram API response:', JSON.stringify(data, null, 2))

    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim()

    if (!transcript) {
      console.error('No transcript in response. Full response:', JSON.stringify(data, null, 2))
      throw new Error('No transcript returned from Deepgram. The audio might be too quiet or contain no speech.')
    }

    console.log('Successfully transcribed audio:', transcript)
    return NextResponse.json({ text: transcript })
  } catch (error) {
    console.error('Error in speech-to-text API:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to transcribe audio: ${error.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
} 