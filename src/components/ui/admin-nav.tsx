'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, QrCode, Users } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: Home
    },
    {
      href: '/admin',
      label: 'Leads',
      icon: Users
    },
    {
      href: '/qr',
      label: 'QR Code',
      icon: QrCode
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-14 items-center space-x-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                'hover:bg-gray-800/50',
                pathname === href
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400'
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 