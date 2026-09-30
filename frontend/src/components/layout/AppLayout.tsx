import React from 'react';
import Head from 'next/head';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { LoginRequiredModal } from '../common/LoginRequiredModal';
import { useSportsStream } from '../../hooks/useSportsStream';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = 'AI Sports Tracker | Real-Time Scores, Tactical Analysis & Predictions',
  description = 'Production-grade AI sports tracking platform featuring real-time Server-Sent Events, Redis caching, and shared AI Platform tactical debriefs across Soccer, Cricket, Basketball, and Tennis.',
}) => {
  const { status: sseStatus } = useSportsStream();

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-gray-100 selection:bg-cyan-500 selection:text-black">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar sseStatus={sseStatus} />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full overflow-hidden">{children}</main>
      </div>

      <Footer />
      <LoginRequiredModal />
    </div>
  );
};
