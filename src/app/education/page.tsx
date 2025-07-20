import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { StudyHelper } from '@/components/education/study-helper';
import { Footer } from '@/components/layout/footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Eğitim Destek Merkezi - Gelişmiş Lise Forumu',
  description: 'Ders sorularını sor, çalışma gruplarına katıl, ders notlarını paylaş. Lise eğitiminde başarılı olmak için ihtiyacın olan her şey burada.',
};

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <StudyHelper />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}