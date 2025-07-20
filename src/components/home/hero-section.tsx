'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  MessageCircle, 
  Trophy, 
  Sparkles,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Türkiye'nin En İyi Lise Forumu",
      subtitle: "Arkadaşlık kur, ders yardımı al, eğlenceli içerikleri keşfet",
      image: "/hero-1.jpg",
      stats: { users: "50K+", topics: "100K+", schools: "1000+" }
    },
    {
      title: "Eğlenceli Öğrenme Deneyimi",
      subtitle: "Oyunlar, yarışmalar ve rozetlerle öğrenmeyi eğlenceli hale getir",
      image: "/hero-2.jpg",
      stats: { badges: "200+", challenges: "50+", rewards: "1000+" }
    },
    {
      title: "Güvenli ve Moderasyonlu",
      subtitle: "Yaşına uygun içerik ve güvenli ortamda sosyalleş",
      image: "/hero-3.jpg",
      stats: { moderators: "24/7", safety: "100%", trust: "⭐⭐⭐⭐⭐" }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
      
      {/* Floating Elements */}
      <div className="absolute left-10 top-20 animate-bounce-gentle">
        <div className="rounded-full bg-primary-100 p-3">
          <Users className="h-6 w-6 text-primary-600" />
        </div>
      </div>
      <div className="absolute right-10 top-32 animate-bounce-gentle delay-1000">
        <div className="rounded-full bg-secondary-100 p-3">
          <MessageCircle className="h-6 w-6 text-secondary-600" />
        </div>
      </div>
      <div className="absolute left-20 bottom-20 animate-bounce-gentle delay-2000">
        <div className="rounded-full bg-success-100 p-3">
          <Trophy className="h-6 w-6 text-success-600" />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="secondary" className="inline-flex items-center space-x-2 px-4 py-2">
              <Sparkles className="h-4 w-4" />
              <span>Yeni özellikler eklendi!</span>
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            <span className="gradient-text">
              {currentSlideData.title}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="mb-8 text-lg text-gray-600 sm:text-xl"
          >
            {currentSlideData.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mb-12 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            <Button size="lg" className="group" asChild>
              <Link href="/auth/register">
                Hemen Başla
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="group" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-4 w-4" />
                Demo İzle
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-soft"
          >
            {Object.entries(currentSlideData.stats).map(([key, value], index) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {value}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {key === 'users' && 'Aktif Kullanıcı'}
                  {key === 'topics' && 'Konu'}
                  {key === 'schools' && 'Okul'}
                  {key === 'badges' && 'Rozet'}
                  {key === 'challenges' && 'Challenge'}
                  {key === 'rewards' && 'Ödül'}
                  {key === 'moderators' && 'Moderasyon'}
                  {key === 'safety' && 'Güvenlik'}
                  {key === 'trust' && 'Güven'}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Slide Indicators */}
          <div className="mt-8 flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="h-12 w-full fill-white"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
        </svg>
      </div>
    </section>
  );
}