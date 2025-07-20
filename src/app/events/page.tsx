import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { EventManager } from '@/components/events/event-manager';
import { Footer } from '@/components/layout/footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Etkinlik & Duyuru Merkezi - Gelişmiş Lise Forumu',
  description: 'Yakındaki etkinlikleri keşfet, duyuruları takip et. Lise öğrencileri için özel etkinlikler ve önemli duyurular.',
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <EventManager />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}