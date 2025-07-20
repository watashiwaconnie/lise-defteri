import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { LatestPostsSection } from '@/components/home/latest-posts-section';
import { ForumPreviewSection } from '@/components/home/forum-preview-section';
import { Footer } from '@/components/layout/footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Latest Posts Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <LatestPostsSection />
        </Suspense>
        
        {/* Forum Preview Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <ForumPreviewSection />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}