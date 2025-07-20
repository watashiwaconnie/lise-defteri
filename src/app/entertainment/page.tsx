import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DailyPoll } from '@/components/polls/daily-poll';
import { PhotoContest } from '@/components/contests/photo-contest';
import { MusicPlayer } from '@/components/music/music-player';
import { MemeGenerator } from '@/components/memes/meme-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Vote, 
  Camera, 
  Music, 
  Laugh,
  Sparkles
} from 'lucide-react';

export const metadata = {
  title: 'Eğlence Merkezi - Gelişmiş Lise Forumu',
  description: 'Günlük anketler, fotoğraf yarışmaları, müzik paylaşımı ve meme oluşturucu. Eğlenceli içeriklerle dolu lise forumu.',
};

export default function EntertainmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-8">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Eğlence Merkezi</h1>
              <Sparkles className="h-8 w-8" />
            </div>
            <p className="text-xl text-purple-100">
              Günlük anketler, yarışmalar, müzik ve daha fazlası!
            </p>
          </div>
        </Card>

        {/* Entertainment Tabs */}
        <Tabs defaultValue="polls" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="polls" className="flex items-center space-x-2">
              <Vote className="h-4 w-4" />
              <span>Anketler</span>
            </TabsTrigger>
            <TabsTrigger value="contests" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Yarışmalar</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span>Müzik</span>
            </TabsTrigger>
            <TabsTrigger value="memes" className="flex items-center space-x-2">
              <Laugh className="h-4 w-4" />
              <span>Meme'ler</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="polls">
            <Suspense fallback={<LoadingSpinner />}>
              <DailyPoll />
            </Suspense>
          </TabsContent>

          <TabsContent value="contests">
            <Suspense fallback={<LoadingSpinner />}>
              <PhotoContest />
            </Suspense>
          </TabsContent>

          <TabsContent value="music">
            <Suspense fallback={<LoadingSpinner />}>
              <MusicPlayer />
            </Suspense>
          </TabsContent>

          <TabsContent value="memes">
            <Suspense fallback={<LoadingSpinner />}>
              <MemeGenerator />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}