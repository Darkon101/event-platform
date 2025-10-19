'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <>{children}</>;
}