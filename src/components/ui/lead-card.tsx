import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Star } from 'lucide-react';
import Image from 'next/image';
import { BusinessCardSubmissionDB, IDENTITIES } from '@/types';

interface LeadCardProps {
  lead: BusinessCardSubmissionDB & { id: string };
  isSelected: boolean;
  isAnnotated: boolean;
  onClick: () => void;
}

export function LeadCard({ lead, isSelected, isAnnotated, onClick }: LeadCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected ? 'bg-gray-800' : 'bg-gray-900'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-white">{lead.name || 'Anonymous'}</div>
            <div className="text-gray-400">{lead.email}</div>
            {lead.organization && (
              <div className="text-gray-500">{lead.organization}</div>
            )}
          </div>
          {isAnnotated && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        {lead.note && (
          <div className="mt-2 text-gray-400">{lead.note}</div>
        )}

        {isAnnotated && lead.adminAnnotation?.text && (
          <div className="mt-2 p-2 bg-gray-800 rounded-md">
            {lead.adminAnnotation.identities && lead.adminAnnotation.identities.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {lead.adminAnnotation.identities.map(identity => (
                  <span
                    key={identity}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200"
                  >
                    {IDENTITIES.find(i => i.value === identity)?.label}
                  </span>
                ))}
              </div>
            )}
            <div className="text-gray-300">{lead.adminAnnotation.text}</div>
            {lead.adminAnnotation.audioUrl && (
              <audio
                controls
                src={lead.adminAnnotation.audioUrl}
                className="w-full mt-2"
              />
            )}
            {lead.adminAnnotation.photoUrl && (
              <div className="relative w-full h-64 mt-2">
                <Image
                  src={lead.adminAnnotation.photoUrl}
                  alt="Lead photo attachment"
                  fill
                  className="object-contain rounded-md"
                  unoptimized
                />
              </div>
            )}
            <div className="text-sm text-gray-500 mt-1">
              Annotated by {lead.adminAnnotation.createdBy}
            </div>
          </div>
        )}

        {lead.aiAnalysis && (
          <div className="mt-2 p-2 bg-gray-800/50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">AI Analysis</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      lead.aiAnalysis && index < lead.aiAnalysis.relevanceScore
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {lead.aiAnalysis.analysis}
            </div>
            {lead.aiAnalysis.suggestedIdentities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lead.aiAnalysis.suggestedIdentities.map(identity => (
                  <span
                    key={identity}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300"
                  >
                    {IDENTITIES.find(i => i.value === identity)?.label}
                  </span>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Last analyzed: {lead.aiAnalysis.lastAnalyzed.toDate().toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 