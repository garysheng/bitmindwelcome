'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormStep } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, ExternalLink } from 'lucide-react';

export function WelcomeForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<FormStep>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [leadDocId, setLeadDocId] = useState<string | null>(null);
  const [teammateName, setTeammateName] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    const teammate = searchParams.get('teammate');
    if (teammate) {
      setTeammateName(teammate);
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
              aiAnalysis: null,
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
          
          setIsSubmitting(true);
          if (value) { // Only update if a value was provided
            await updateDoc(doc(db, 'leads', leadDocId), {
              name: value,
              updatedAt: serverTimestamp()
            });
            setFormData(prev => ({ ...prev, name: value }));
          }
          
          // Move to thanks screen immediately after name
          nextStep = 'thanks';
          setCurrentStep(nextStep);
          setIsSubmitting(false);
          break;
      }

      setCurrentStep(nextStep);
    } catch (error) {
      console.error('Error handling submission:', error);
      setIsSubmitting(false);
    }
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="thanks"
                className="text-center space-y-6"
                {...slideAnimation}
              >
                <div className="space-y-2">
                  <p className="text-gray-300 font-satori font-bold">Thanks for connecting!</p>
                  <p className="text-gray-400">We'd love to have you try our AI detector Chrome extension</p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-left">
                  <h3 className="font-satori font-bold text-white text-sm mb-2 flex items-center">
                    <Chrome className="w-4 h-4 mr-1" />
                    BitMind AI Detector Extension
                  </h3>
                  <p className="text-gray-400 text-xs mb-3">
                    Automatically detect AI-generated content as you browse the web.
                  </p>
                  <Button 
                    className="w-full bg-white text-black hover:bg-gray-100 font-medium flex items-center justify-center gap-2"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/ai-detector-bitmind/ejlhmbdnjjlifeeelpnlkkechnmojnhg', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download Extension
                  </Button>
                </div>
                
                <Button 
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => window.location.href = 'https://bitmind.ai'}
                >
                  Visit BitMind Homepage
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}