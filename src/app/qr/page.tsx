'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { AdminNav } from '@/components/ui/admin-nav';

export default function QRPage() {
  const url = 'https://irl.bitmind.ai';
  
  return (
    <>
      <AdminNav />
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 gradient-animate" />
        <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/80" />
        
        <Card className="w-full max-w-md border-gray-800 bg-[#1A1A1A]/90 backdrop-blur-sm p-8 flex flex-col items-center gap-6 relative z-10 animated-border">
          <Image
            src="/Bitmind_3D_LOGO_TransparentBG.png"
            alt="BitMind"
            width={200}
            height={60}
            priority
            className="h-16 w-auto"
          />
          
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={url}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-center">
            <p className="text-white font-satori text-lg">Scan to connect</p>
            <p className="text-gray-400 font-satori">{url}</p>
          </div>
        </Card>
      </main>
    </>
  );
} 