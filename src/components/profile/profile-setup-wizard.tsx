'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Heart,
  Music,
  Gamepad2,
  Camera,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileSetupWizardProps {
  user: User;
  profile: Profile | null;
}

interface PersonalityType {
  code: string;
  name: string;
  description: string;
}

interface InterestCategory {
  id: string;
  name: string;
  interests: string[];
  icon: string;
}

const steps = [
  { id: 'basic', title: 'Temel Bilgiler', icon: UserIcon },
  { id: 'personality', title: 'Kişilik Testi', icon: Heart },
  { id: 'interests', title: 'İlgi Alanları', icon: Sparkles },
  { id: 'music', title: 'Müzik Zevki', icon: Music },
  { id: 'hobbies', title: 'Hobiler', icon: Gamepad2 },
  { id: 'avatar', title: 'Profil Fotoğrafı', icon: Camera },
];

export function ProfileSetupWizard({ user, profile }: ProfileSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    school: profile?.school || '',
    grade: profile?.grade || null,
    city: profile?.city || '',
    bio: profile?.bio || '',
    personality_type: profile?.personality_type || '',
    interests: profile?.interests || [],
    music_taste: profile?.music_taste || [],
    hobbies: profile?.hobbies || [],
    avatar_url: profile?.avatar_url || '',
  });

  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>([]);
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadPersonalityTypes();
    loadInterestCategories();
  }, []);

  const loadPersonalityTypes = async () => {
    try {
      const { data } = await supabase
        .from('personality_types')
        .select('code, name, description')
        .order('code');

      if (data) {
        setPersonalityTypes(data);
      }
    } catch (error) {
      console.error('Error loading personality types:', error);
    }
  };

  const loadInterestCategories = async () => {
    try {
      const { data } = await supabase
        .from('interest_categories')
        .select('*')
        .order('name');

      if (data) {
        setInterestCategories(data);
      }
    } catch (error) {
      console.error('Error loading interest categories:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          school: formData.school,
          grade: formData.grade,
          city: formData.city,
          bio: formData.bio,
          personality_type: formData.personality_type,
          interests: formData.interests,
          music_taste: formData.music_taste,
          hobbies: formData.hobbies,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil başarıyla tamamlandı!',
        description: 'Artık platformun tüm özelliklerini kullanabilirsin.',
        type: 'success'
      });
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Profil güncellenirken hata oluştu',
        description: 'Lütfen tekrar deneyin.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleMusicTaste = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      music_taste: prev.music_taste.includes(genre)
        ? prev.music_taste.filter(g => g !== genre)
        : [...prev.music_taste, genre]
    }));
  };

  const toggleHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Görünen Ad
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="input w-full"
                placeholder="Adın ve soyadın"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Okul
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  className="input w-full"
                  placeholder="Okul adın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sınıf
                </label>
                <select
                  value={formData.grade || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value ? parseInt(e.target.value) : null }))}
                  className="input w-full"
                >
                  <option value="">Sınıf seç</option>
                  <option value="9">9. Sınıf</option>
                  <option value="10">10. Sınıf</option>
                  <option value="11">11. Sınıf</option>
                  <option value="12">12. Sınıf</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="input w-full"
                placeholder="Hangi şehirde yaşıyorsun?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hakkında
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="input w-full h-24 resize-none"
                placeholder="Kendinden bahset..."
              />
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kişilik Tipini Seç
              </h3>
              <p className="text-gray-600">
                Hangi kişilik tipi sana en uygun? (MBTI tabanlı)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {personalityTypes.map((type) => (
                <button
                  key={type.code}
                  onClick={() => setFormData(prev => ({ ...prev, personality_type: type.code }))}
                  className={`p-4 rounded-lg border-2 transition-all ${formData.personality_type === type.code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-sm font-bold text-primary-600 mb-1">
                    {type.code}
                  </div>
                  <div className="text-xs text-gray-700 font-medium">
                    {type.name}
                  </div>
                </button>
              ))}
            </div>

            {formData.personality_type && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  {personalityTypes.find(t => t.code === formData.personality_type)?.description}
                </div>
              </div>
            )}
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                İlgi Alanlarını Seç
              </h3>
              <p className="text-gray-600">
                İlgilendiğin konuları seç (birden fazla seçebilirsin)
              </p>
            </div>

            {interestCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {formData.interests.includes(interest) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'music':
        const musicGenres = [
          'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical',
          'Country', 'Reggae', 'Blues', 'Folk', 'Punk', 'Metal', 'Indie',
          'Alternative', 'Türkçe Pop', 'Arabesk', 'Türk Halk Müziği'
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Müzik Zevkin
              </h3>
              <p className="text-gray-600">
                Hangi müzik türlerini seviyorsun?
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {musicGenres.map((genre) => (
                <Badge
                  key={genre}
                  variant={formData.music_taste.includes(genre) ? 'secondary' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleMusicTaste(genre)}
                >
                  {genre}
                  {formData.music_taste.includes(genre) && (
                    <Check className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'hobbies':
        const hobbies = [
          'Okuma', 'Yazma', 'Çizim', 'Fotoğrafçılık', 'Müzik Dinleme',
          'Enstrüman Çalma', 'Dans', 'Spor', 'Yemek Yapma', 'Bahçıvanlık',
          'El Sanatları', 'Koleksiyon', 'Seyahat', 'Oyun Oynama',
          'Film İzleme', 'Dizi İzleme', 'Podcast Dinleme', 'Yoga',
          'Meditasyon', 'Gönüllülük'
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hobilerin
              </h3>
              <p className="text-gray-600">
                Boş zamanlarında ne yapmayı seviyorsun?
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby) => (
                <Badge
                  key={hobby}
                  variant={formData.hobbies.includes(hobby) ? 'success' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleHobby(hobby)}
                >
                  {hobby}
                  {formData.hobbies.includes(hobby) && (
                    <Check className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profil Fotoğrafı
              </h3>
              <p className="text-gray-600">
                Profil fotoğrafın için bir URL ekle (isteğe bağlı)
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>

              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                className="input w-full max-w-md mx-auto"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCompleted
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : isActive
                      ? 'border-primary-500 text-primary-500'
                      : 'border-gray-300 text-gray-400'
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep].title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Adım {currentStep + 1} / {steps.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleFinish}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? 'Kaydediliyor...' : 'Tamamla'}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex items-center"
          >
            İleri
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}