'use client';

import { AuthProvider } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navigation />
      {children}
    </AuthProvider>
  );
}
