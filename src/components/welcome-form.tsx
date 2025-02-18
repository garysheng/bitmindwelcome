'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormStep, BITMIND_TEAMMATES } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export function WelcomeForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<FormStep>('email');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    organization: '',
    teammateMet: 'ken',
    xHandle: '',
    note: ''
  });
  const [leadDocId, setLeadDocId] = useState<string | null>(null);
  const [teammateName, setTeammateName] = useState('Ken Miyachi');
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    const teammate = searchParams.get('teammate');
    if (teammate) {
      setTeammateName(teammate);
      setFormData(prev => ({ ...prev, teammateMet: teammate }));
    }
  }, [searchParams]);

  const getLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number } | null> => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.log('Error getting location:', error);
      return null;
    }
  };

  const handleSubmit = async (value: string) => {
    let nextStep: FormStep = 'email';

    try {
      switch (currentStep) {
        case 'email':
          // Check if email already exists
          const leadsRef = collection(db, 'leads');
          const q = query(leadsRef, where("email", "==", value));
          const querySnapshot = await getDocs(q);
          
          setIsGettingLocation(true);
          const locationData = await getLocation();
          setIsGettingLocation(false);
          
          let docId;
          if (!querySnapshot.empty) {
            // Email exists, get the first matching document
            docId = querySnapshot.docs[0].id;
            await updateDoc(doc(db, 'leads', docId), {
              updatedAt: serverTimestamp(),
              ...(locationData && {
                location: {
                  ...locationData,
                  timestamp: serverTimestamp()
                }
              })
            });
          } else {
            // Create new document if email doesn't exist
            const docRef = await addDoc(leadsRef, {
              email: value,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isAnnotated: false,
              ...(locationData && {
                location: {
                  ...locationData,
                  timestamp: serverTimestamp()
                }
              })
            });
            docId = docRef.id;
          }
          
          setLeadDocId(docId);
          setFormData(prev => ({ ...prev, email: value }));
          nextStep = 'name';
          break;
        case 'name':
          if (!leadDocId) throw new Error('No lead document ID found');
          if (value) { // Only update if a value was provided
            await updateDoc(doc(db, 'leads', leadDocId), {
              name: value,
              updatedAt: serverTimestamp()
            });
            setFormData(prev => ({ ...prev, name: value }));
          }
          nextStep = 'organization';
          break;
        case 'organization':
          if (!leadDocId) throw new Error('No lead document ID found');
          if (value) { // Only update if a value was provided
            await updateDoc(doc(db, 'leads', leadDocId), {
              organization: value,
              updatedAt: serverTimestamp()
            });
            setFormData(prev => ({ ...prev, organization: value }));
          }
          nextStep = formData.teammateMet ? 'xhandle' : 'teammate';
          break;
        case 'teammate':
          if (!leadDocId) throw new Error('No lead document ID found');
          if (value) { // Only update if a value was provided
            await updateDoc(doc(db, 'leads', leadDocId), {
              teammateMet: value,
              updatedAt: serverTimestamp()
            });
            setFormData(prev => ({ ...prev, teammateMet: value }));
          }
          nextStep = 'xhandle';
          break;
        case 'xhandle':
          if (!leadDocId) throw new Error('No lead document ID found');
          if (value) {
            const formattedHandle = formatXHandle(value);
            if (!validateXHandle(formattedHandle)) {
              setError('Please enter a valid X handle (max 15 characters, letters, numbers, and underscores only)');
              return;
            }
            await updateDoc(doc(db, 'leads', leadDocId), {
              xHandle: formattedHandle,
              updatedAt: serverTimestamp()
            });
            setFormData(prev => ({ ...prev, xHandle: formattedHandle }));
          }
          setError(null);
          nextStep = 'note';
          break;
        case 'note':
          if (!leadDocId) throw new Error('No lead document ID found');
          if (value) { // Only update if a note was provided
            await updateDoc(doc(db, 'leads', leadDocId), {
              note: value,
              updatedAt: serverTimestamp()
            });
            setFormData(prev => ({ ...prev, note: value }));
          }
          nextStep = 'thanks';
          setTimeout(() => {
            window.location.href = 'https://bitmind.ai';
          }, 3000);
          break;
      }

      setCurrentStep(nextStep);
    } catch (error) {
      console.error('Error handling submission:', error);
    }
  };

  const validateXHandle = (handle: string): boolean => {
    if (!handle) return true; // Empty is valid since it's optional
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    // X handle rules: letters, numbers, underscores, no spaces, max 15 chars (excluding @)
    const validXHandleRegex = /^@[A-Za-z0-9_]{1,15}$/;
    return validXHandleRegex.test(cleanHandle);
  };

  const formatXHandle = (handle: string): string => {
    if (!handle) return '';
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const slideAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <Card className="w-full max-w-md border-gray-800 bg-[#1A1A1A]/90 backdrop-blur-sm h-[420px] flex flex-col overflow-hidden relative z-10 animated-border">
      <CardHeader className="pb-0 pt-6 shrink-0">
        <div className="flex justify-center w-full">
          <Image
            src="/Bitmind_3D_LOGO_TransparentBG.png"
            alt="BitMind"
            width={400}
            height={120}
            priority
            className="h-32 w-auto"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col justify-start pb-6">
        <div className="w-full max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'email' ? (
              <motion.div 
                key="email"
                className="space-y-4"
                {...slideAnimation}
              >
                <CardDescription className="text-center mb-4 text-gray-300 font-satori">
                  {teammateName ? (
                    <>
                      It was great meeting you in Denver! Let&apos;s stay connected and continue our conversation.
                      <div className="mt-2 font-bold">— {teammateName}</div>
                    </>
                  ) : (
                    <>It was great meeting you in Denver! Let&apos;s stay connected and continue our conversation.</>
                  )}
                </CardDescription>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#1A1A1A] border-gray-700 text-gray-300 placeholder:text-gray-600"
                  value={formData.email}
                  autoFocus
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e.currentTarget.value)}
                />
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={(e) => handleSubmit((e.currentTarget.previousElementSibling as HTMLInputElement).value)}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? 'Getting Location...' : 'Next'}
                </Button>
              </motion.div>
            ) : currentStep === 'name' ? (
              <motion.div 
                key="name"
                className="space-y-4"
                {...slideAnimation}
              >
                <CardDescription className="text-center mb-4 text-gray-300 font-satori font-bold">
                  What&apos;s your name?
                </CardDescription>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  className="bg-[#1A1A1A] border-gray-700 text-gray-300 placeholder:text-gray-600"
                  value={formData.name}
                  autoFocus
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e.currentTarget.value)}
                />
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={(e) => handleSubmit((e.currentTarget.previousElementSibling as HTMLInputElement).value)}
                >
                  Next
                </Button>
              </motion.div>
            ) : currentStep === 'organization' ? (
              <motion.div 
                key="organization"
                className="space-y-4"
                {...slideAnimation}
              >
                <CardDescription className="text-center mb-4 text-gray-300 font-satori font-bold">
                  What organization are you with?
                </CardDescription>
                <Input
                  type="text"
                  placeholder="Enter your organization"
                  className="bg-[#1A1A1A] border-gray-700 text-gray-300 placeholder:text-gray-600"
                  value={formData.organization}
                  autoFocus
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e.currentTarget.value)}
                />
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={(e) => handleSubmit((e.currentTarget.previousElementSibling as HTMLInputElement).value)}
                >
                  Next
                </Button>
              </motion.div>
            ) : currentStep === 'teammate' ? (
              <motion.div 
                key="teammate"
                className="space-y-4"
                {...slideAnimation}
              >
                <CardDescription className="text-center mb-4 text-gray-300 font-satori font-bold">
                  Which BitMind teammate did you meet?
                </CardDescription>
                <select
                  className="w-full p-2 rounded-md border border-gray-700 bg-[#1A1A1A] text-gray-300"
                  defaultValue="ken"
                  autoFocus
                  onChange={(e) => handleSubmit(e.target.value)}
                >
                  <option value="" disabled>Select BitMind teammate</option>
                  {BITMIND_TEAMMATES.map(teammate => (
                    <option key={teammate.id} value={teammate.id}>
                      {teammate.name}
                    </option>
                  ))}
                </select>
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={() => handleSubmit("")}
                >
                  Next
                </Button>
              </motion.div>
            ) : currentStep === 'xhandle' ? (
              <motion.div 
                key="xhandle"
                className="space-y-4"
                {...slideAnimation}
              >
                <CardDescription className="text-center mb-4 text-gray-300 font-satori font-bold">
                  What&apos;s your X (Twitter) handle?
                </CardDescription>
                <Input
                  type="text"
                  placeholder="@username"
                  className="bg-[#1A1A1A] border-gray-700 text-gray-300 placeholder:text-gray-600"
                  value={formData.xHandle}
                  autoFocus
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, xHandle: value }));
                    if (value && !validateXHandle(formatXHandle(value))) {
                      setError('Please enter a valid X handle (max 15 characters, letters, numbers, and underscores only)');
                    } else {
                      setError(null);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e.currentTarget.value)}
                />
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={(e) => handleSubmit((e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement)?.value)}
                  disabled={!!error}
                >
                  Next
                </Button>
              </motion.div>
            ) : currentStep === 'note' ? (
              <motion.div 
                key="note"
                className="space-y-4"
                {...slideAnimation}
              >
                <CardDescription className="text-center mb-4 text-gray-300 font-satori font-bold">
                  Would you like to add a note about what we discussed or what you&apos;d like to discuss?
                </CardDescription>
                <Textarea
                  placeholder="Enter your note here..."
                  className="min-h-[100px] bg-[#1A1A1A] border-gray-700 text-gray-300 placeholder:text-gray-600"
                  value={formData.note}
                  autoFocus
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                />
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-100"
                  onClick={(e) => handleSubmit((e.currentTarget.previousElementSibling as HTMLTextAreaElement).value)}
                >
                  Finish
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="thanks"
                className="text-center space-y-4"
                {...slideAnimation}
              >
                <p className="text-gray-300 font-satori font-bold">Thanks for connecting! Looking forward to continuing our conversation.</p>
                <p className="text-sm text-gray-500 font-satori">Redirecting to bitmind.ai...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}