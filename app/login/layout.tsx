import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Sign in · Manuscript Builder',
  description: 'Sign in to your shared Bag Of Holding Tools account. Manuscript editing is also available without an account.',
  path: '/login', noindex: true,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
