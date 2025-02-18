'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessCardSubmissionDB, Identity } from '@/types';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, orderBy, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AdminNav } from '@/components/ui/admin-nav';
import { LeadCard } from '@/components/ui/lead-card';
import { LeadAnnotationForm } from '@/components/ui/lead-annotation-form';
import { Inbox, CheckCircle } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/lib/auth-context';
import { ManualLeadDialog } from '@/components/ui/manual-lead-dialog';

function AdminPageContent() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<(BusinessCardSubmissionDB & { id: string })[]>([]);
  const [activeTab, setActiveTab] = useState('unannotated');
  const [selectedLead, setSelectedLead] = useState<(BusinessCardSubmissionDB & { id: string }) | null>(null);
  const [annotation, setAnnotation] = useState('');
  const [selectedIdentities, setSelectedIdentities] = useState<Identity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const leadsRef = collection(db, 'leads');
    const q = query(
      leadsRef,
      where('isAnnotated', '==', activeTab === 'annotated'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (BusinessCardSubmissionDB & { id: string })[];

        setLeads(leadsData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching leads:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    if (selectedLead?.adminAnnotation?.identities) {
      setSelectedIdentities(selectedLead.adminAnnotation.identities);
    } else {
      setSelectedIdentities([]);
    }
    if (selectedLead?.adminAnnotation?.text) {
      setAnnotation(selectedLead.adminAnnotation.text);
    } else {
      setAnnotation('');
    }
    if (selectedLead?.adminAnnotation?.photoUrl) {
      setCurrentPhotoUrl(selectedLead.adminAnnotation.photoUrl);
    } else {
      setCurrentPhotoUrl(null);
    }
  }, [selectedLead]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLead) return;

    try {
      // Create local URL for preview and store the file
      const localUrl = URL.createObjectURL(file);
      setCurrentPhotoUrl(localUrl);
    } catch (error) {
      console.error('Error handling photo upload:', error);
    }
  };

  const handleRecordingComplete = async (blob: Blob, mimeType: string) => {
    if (!selectedLead) return;

    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('mimeType', mimeType);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');

      const { text } = await response.json();

      // Just append the transcribed text
      const newAnnotation = text ? `${annotation}\n\n${text}` : annotation;
      setAnnotation(newAnnotation);

      setIsTranscribing(false);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setIsTranscribing(false);
    }
  };

  const handleRecordingError = (error: Error) => {
    console.error('Recording error:', error);
  };

  const handleSubmitNote = async () => {
    if (!selectedLead || !annotation.trim() || !user) return;

    try {
      setIsLoading(true);

      // Upload photo if there's a local URL
      let uploadedPhotoUrl = null;
      if (currentPhotoUrl) {
        if (currentPhotoUrl.startsWith('blob:')) {
          try {
            const response = await fetch(currentPhotoUrl);
            const blob = await response.blob();
            const storageRef = ref(storage, `leads/${selectedLead.id}/photos/${Date.now()}.jpg`);
            await uploadBytes(storageRef, blob);
            uploadedPhotoUrl = await getDownloadURL(storageRef);
            // Revoke the local URL to free up memory
            URL.revokeObjectURL(currentPhotoUrl);
          } catch (uploadError) {
            console.error('Error uploading photo:', uploadError);
            setIsLoading(false);
            return;
          }
        } else {
          // If it's not a blob URL, it's already uploaded
          uploadedPhotoUrl = currentPhotoUrl;
        }
      }

      // Update the lead document with all annotation data
      const updateData = {
        adminAnnotation: {
          text: annotation,
          audioUrl: currentAudioUrl,
          photoUrl: uploadedPhotoUrl,
          createdAt: serverTimestamp(),
          createdBy: user.email, // Use authenticated user's email
          identities: selectedIdentities
        },
        isAnnotated: true,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'leads', selectedLead.id), updateData);

      // Reset form state
      setAnnotation('');
      setSelectedIdentities([]);
      setSelectedLead(null);
      setCurrentAudioUrl(null);
      setCurrentPhotoUrl(null);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIdentity = (identity: Identity) => {
    setSelectedIdentities(prev =>
      prev.includes(identity)
        ? prev.filter(i => i !== identity)
        : [...prev, identity]
    );
  };

  return (
    <>
      <AdminNav />
      <main className="min-h-screen p-8 pt-20 bg-gray-950">
        <Card className="max-w-6xl mx-auto bg-[#1A1A1A]/90 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-satori text-white">Lead Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Logged in as {user?.email} • Review and annotate leads from business card submissions
                </CardDescription>
              </div>
              <ManualLeadDialog />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="unannotated" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="unannotated" className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  Unannotated
                </TabsTrigger>
                <TabsTrigger value="annotated" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Annotated
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unannotated" className="space-y-4">
                {isLoading ? (
                  <div className="text-center text-gray-400">Loading leads...</div>
                ) : leads.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-satori text-white">All caught up!</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      You&apos;ve reviewed all leads. Great job! Check back later for new submissions.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {leads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          isSelected={selectedLead?.id === lead.id}
                          isAnnotated={false}
                          onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                        />
                      ))}
                    </div>

                    {selectedLead && (
                      <LeadAnnotationForm
                        annotation={annotation}
                        selectedIdentities={selectedIdentities}
                        currentPhotoUrl={currentPhotoUrl}
                        isLoading={isLoading}
                        isTranscribing={isTranscribing}
                        isAnnotated={false}
                        onAnnotationChange={setAnnotation}
                        onIdentityToggle={toggleIdentity}
                        onPhotoUpload={handlePhotoUpload}
                        onRecordingComplete={handleRecordingComplete}
                        onRecordingError={handleRecordingError}
                        onSubmit={handleSubmitNote}
                      />
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="annotated" className="space-y-4">
                {isLoading ? (
                  <div className="text-center text-gray-400">Loading leads...</div>
                ) : leads.length === 0 ? (
                  <div className="text-center text-gray-400">No annotated leads</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {leads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          isSelected={selectedLead?.id === lead.id}
                          isAnnotated={true}
                          onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                        />
                      ))}
                    </div>

                    {selectedLead && (
                      <LeadAnnotationForm
                        annotation={annotation}
                        selectedIdentities={selectedIdentities}
                        currentPhotoUrl={currentPhotoUrl}
                        isLoading={isLoading}
                        isTranscribing={isTranscribing}
                        isAnnotated={true}
                        onAnnotationChange={setAnnotation}
                        onIdentityToggle={toggleIdentity}
                        onPhotoUpload={handlePhotoUpload}
                        onRecordingComplete={handleRecordingComplete}
                        onRecordingError={handleRecordingError}
                        onSubmit={handleSubmitNote}
                      />
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminPageContent />
    </AuthGuard>
  );
} 