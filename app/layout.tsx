import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { PwaRegister } from '@/components/pwa/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#06b6d4',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ChemLab VLab | Interactive Virtual Chemistry Laboratory (NOBOOK × ChemMCP)',
  description: 'World-class interactive virtual chemistry laboratory powered by NOBOOK procedural graphics, ChemCollective simulation, and ChemMCP chemical intelligence.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ChemLab VLab',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

