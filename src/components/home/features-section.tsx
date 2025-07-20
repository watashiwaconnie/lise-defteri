'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  BookOpen, 
  Heart, 
  Shield,
  Zap,
  Star,
  Camera,
  Music
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: Users,
    title: 'Arkadaşlık Sistemi',
    description: 'Ortak ilgi alanlarına sahip arkadaşlar bul, uyumluluk skorunu keşfet',
    color: 'text-primary-500',
    bgColor: 'bg-primary-50',
  },
  {
    icon: MessageCircle,
    title: 'Akıllı Forum',
    description: 'Kategorilere göre organize edilmiş, trend analizi yapan forum sistemi',
    color: 'text-secondary-500',
    bgColor: 'bg-secondary-50',
  },
  {
    icon: Trophy,
    title: 'Gamifikasyon',
    description: 'Puanlar, rozetler ve seviyelerle eğlenceli öğrenme deneyimi',
    color: 'text-warning-500',
    bgColor: 'bg-warning-50',
  },
  {
    icon: BookOpen,
    title: 'Ders Yardımı',
    description: 'Uzman öğrencilerden ders yardımı al, çalışma grupları oluştur',
    color: 'text-success-500',
    bgColor: 'bg-success-50',
  },
  {
    icon: Heart,
    title: 'Kişilik Testi',
    description: 'MBTI tabanlı kişilik analizi ile kendini keşfet',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'Güvenli Ortam',
    description: '24/7 moderasyon ve yaş uygun içerik filtreleme',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Camera,
    title: 'Fotoğraf Yarışmaları',
    description: 'Tema bazlı fotoğraf yarışmalarına katıl, oylamaya katıl',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Music,
    title: 'Müzik Paylaşımı',
    description: 'Spotify entegrasyonu ile müzik zevkini paylaş',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Zap,
    title: 'Real-time Chat',
    description: 'Anlık mesajlaşma ve online durum takibi',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Neler <span className="gradient-text">Sunuyoruz?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lise hayatını daha eğlenceli ve verimli hale getiren özelliklerle dolu platform
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">50K+</div>
              <div className="text-gray-600">Aktif Öğrenci</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-500 mb-2">1000+</div>
              <div className="text-gray-600">Okul</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success-500 mb-2">100K+</div>
              <div className="text-gray-600">Forum Konusu</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning-500 mb-2">200+</div>
              <div className="text-gray-600">Rozet Türü</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}