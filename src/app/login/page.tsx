'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin';

  useEffect(() => {
    if (!loading && user) {
      router.push(returnTo);
    }
  }, [user, loading, router, returnTo]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 gradient-animate" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/80" />
      
      <Card className="w-full max-w-md border-gray-800 bg-[#1A1A1A]/90 backdrop-blur-sm p-8 flex flex-col items-center gap-6 relative z-10 animated-border">
        <CardHeader className="pb-2">
          <Image
            src="/Bitmind_3D_LOGO_TransparentBG.png"
            alt="BitMind"
            width={200}
            height={60}
            priority
            className="h-16 w-auto"
          />
        </CardHeader>
        
        <CardContent className="text-center space-y-6 w-full">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-satori text-white">Admin Access</h2>
            </div>
            <p className="text-gray-400">Sign in to manage BitMind leads and annotations</p>
          </div>

          <Button
            onClick={signIn}
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-100 font-medium"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Sign in with Google
              </div>
            )}
          </Button>

          <p className="text-sm text-gray-500">
            This is a restricted area for BitMind team members
          </p>
        </CardContent>
      </Card>
    </main>
  );
} 