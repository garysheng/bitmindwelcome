'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Redirect if on admin page and not authenticated
      if (!user && pathname?.startsWith('/admin')) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        hd: 'bitmind.ai' // Restrict to BitMind domain
      });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 