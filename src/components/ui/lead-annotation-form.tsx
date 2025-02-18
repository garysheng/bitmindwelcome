import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { VoiceRecorder } from '@/components/ui/voice-recorder';
import { Loader2, ImageIcon, Check } from 'lucide-react';
import { Identity, IDENTITIES } from '@/types';

interface LeadAnnotationFormProps {
  annotation: string;
  selectedIdentities: Identity[];
  currentPhotoUrl: string | null;
  isLoading: boolean;
  isTranscribing: boolean;
  isAnnotated: boolean;
  onAnnotationChange: (value: string) => void;
  onIdentityToggle: (identity: Identity) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRecordingComplete: (blob: Blob, mimeType: string) => Promise<void>;
  onRecordingError: (error: Error) => void;
  onSubmit: () => void;
}

export function LeadAnnotationForm({
  annotation,
  selectedIdentities,
  currentPhotoUrl,
  isLoading,
  isTranscribing,
  isAnnotated,
  onAnnotationChange,
  onIdentityToggle,
  onPhotoUpload,
  onRecordingComplete,
  onRecordingError,
  onSubmit,
}: LeadAnnotationFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <div className="text-sm font-medium text-gray-300 mb-2">Identity (select all that apply)</div>
        <div className="grid grid-cols-2 gap-4">
          {IDENTITIES.map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`${value}${isAnnotated ? '-annotated' : ''}`}
                checked={selectedIdentities.includes(value)}
                onCheckedChange={() => onIdentityToggle(value)}
              />
              <label
                htmlFor={`${value}${isAnnotated ? '-annotated' : ''}`}
                className="text-sm font-medium leading-none text-gray-300 cursor-pointer"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Add your notes about this lead..."
        className="min-h-[200px] bg-gray-900 border-gray-700 text-white"
        value={annotation}
        onChange={(e) => onAnnotationChange(e.target.value)}
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <VoiceRecorder
            onRecordingComplete={onRecordingComplete}
            onError={onRecordingError}
            disabled={isLoading || isTranscribing}
          />
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                type="file"
                accept="image/*"
                onChange={onPhotoUpload}
                className="hidden"
                id={`photo-upload${isAnnotated ? '-annotated' : ''}`}
              />
              <Button
                onClick={() => document.getElementById(`photo-upload${isAnnotated ? '-annotated' : ''}`)?.click()}
                disabled={isLoading || currentPhotoUrl !== null}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full relative"
                type="button"
              >
                <ImageIcon className="h-6 w-6" aria-hidden="true" />
                {currentPhotoUrl && (
                  <Check className="h-4 w-4 text-green-500 absolute bottom-1 right-1" aria-hidden="true" />
                )}
              </Button>
            </form>
          </div>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isLoading || !annotation.trim()}
          className="bg-white text-black hover:bg-gray-100"
        >
          {isAnnotated ? 'Update Note' : 'Submit Note'}
        </Button>
      </div>

      {isTranscribing && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Transcribing audio...</span>
        </div>
      )}
    </div>
  );
} 