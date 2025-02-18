'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { WelcomeForm } from '@/components/welcome-form';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 gradient-animate" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/80" />
      <Suspense fallback={
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
            <div className="w-full max-w-sm mx-auto text-center text-gray-400">
              Loading...
            </div>
          </CardContent>
        </Card>
      }>
        <WelcomeForm />
      </Suspense>
    </main>
  );
}
