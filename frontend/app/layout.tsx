// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ClientLayout from '@/components/layout/ClientLayout';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FeedBackYes™ - Practice Difficult Conversations',
  description: 'AI-powered platform for practicing high-stakes workplace conversations across six core pillars',
  keywords: 'feedback, workplace communication, AI coaching, cultural intelligence, team collaboration',
  authors: [{ name: 'FeedBackYes Team' }],
  openGraph: {
    title: 'FeedBackYes™',
    description: 'Practice difficult conversations with AI-powered coaching',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <ClientLayout>
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            
            <Footer />
          </ClientLayout>
        </div>
      </body>
    </html>
  );
}