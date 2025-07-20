'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Type, 
  Download, 
  Share2, 
  Laugh, 
  TrendingUp,
  Upload,
  Palette,
  RotateCcw,
  Save
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';

interface MemeTemplate {
  id: string;
  name: string;
  image_url: string;
  text_areas: {
    x: number;
    y: number;
    width: number;
    height: number;
    default_text?: string;
  }[];
  usage_count: number;
  category: string;
}

interface CreatedMeme {
  id: string;
  template_id: string;
  image_url: string;
  texts: string[];
  created_by: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes: number;
  shares: number;
  created_at: string;
  user_liked: boolean;
}

const POPULAR_TEMPLATES: MemeTemplate[] = [
  {
    id: '1',
    name: 'Drake Pointing',
    image_url: '/meme-templates/drake.jpg',
    text_areas: [
      { x: 50, y: 20, width: 45, height: 30 },
      { x: 50, y: 55, width: 45, height: 30 }
    ],
    usage_count: 1250,
    category: 'reaction'
  },
  {
    id: '2',
    name: 'Distracted Boyfriend',
    image_url: '/meme-templates/distracted-boyfriend.jpg',
    text_areas: [
      { x: 10, y: 85, width: 25, height: 10, default_text: 'Girlfriend' },
      { x: 40, y: 85, width: 25, height: 10, default_text: 'Me' },
      { x: 70, y: 85, width: 25, height: 10, default_text: 'Other thing' }
    ],
    usage_count: 980,
    category: 'choice'
  },
  {
    id: '3',
    name: 'Woman Yelling at Cat',
    image_url: '/meme-templates/woman-cat.jpg',
    text_areas: [
      { x: 5, y: 10, width: 40, height: 20 },
      { x: 55, y: 10, width: 40, height: 20 }
    ],
    usage_count: 756,
    category: 'argument'
  },
  {
    id: '4',
    name: 'This is Fine',
    image_url: '/meme-templates/this-is-fine.jpg',
    text_areas: [
      { x: 10, y: 80, width: 80, height: 15 }
    ],
    usage_count: 642,
    category: 'situation'
  }
];

export function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [texts, setTexts] = useState<string[]>([]);
  const [customImage, setCustomImage] = useState<string>('');
  const [recentMemes, setRecentMemes] = useState<CreatedMeme[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchRecentMemes();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setTexts(new Array(selectedTemplate.text_areas.length).fill(''));
      drawMeme();
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate || customImage) {
      drawMeme();
    }
  }, [texts, selectedTemplate, customImage]);

  const fetchRecentMemes = async () => {
    try {
      const { data, error } = await supabase
        .from('created_memes')
        .select(`
          *,
          profiles(username, avatar_url),
          meme_likes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      const memes = await Promise.all(
        (data || []).map(async (meme: any) => {
          const { data: likes } = await supabase
            .from('meme_likes')
            .select('id')
            .eq('meme_id', meme.id);

          const { data: shares } = await supabase
            .from('meme_shares')
            .select('id')
            .eq('meme_id', meme.id);

          let userLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from('meme_likes')
              .select('id')
              .eq('meme_id', meme.id)
              .eq('user_id', user.id)
              .single();
            userLiked = !!userLike;
          }

          return {
            id: meme.id,
            template_id: meme.template_id,
            image_url: meme.image_url,
            texts: meme.texts,
            created_by: {
              id: meme.user_id,
              username: meme.profiles.username,
              avatar_url: meme.profiles.avatar_url
            },
            likes: likes?.length || 0,
            shares: shares?.length || 0,
            created_at: meme.created_at,
            user_liked: userLiked
          };
        })
      );

      setRecentMemes(memes);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size
      canvas.width = 500;
      canvas.height = (img.height / img.width) * 500;

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw texts
      if (selectedTemplate) {
        selectedTemplate.text_areas.forEach((area, index) => {
          const text = texts[index] || area.default_text || '';
          if (text) {
            drawText(ctx, text, area, canvas.width, canvas.height);
          }
        });
      }
    };

    img.src = selectedTemplate?.image_url || customImage;
  };

  const drawText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    area: MemeTemplate['text_areas'][0],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const x = (area.x / 100) * canvasWidth;
    const y = (area.y / 100) * canvasHeight;
    const maxWidth = (area.width / 100) * canvasWidth;

    // Text styling
    ctx.font = 'bold 24px Impact, Arial Black, sans-serif';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap
    const words = text.toUpperCase().split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }

    // Draw lines
    const lineHeight = 30;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      ctx.strokeText(line, x, lineY);
      ctx.fillText(line, x, lineY);
    });
  };

  const handleSaveMeme = async () => {
    if (!user || !canvasRef.current) return;

    setLoading(true);
    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Upload to Supabase Storage
      const fileName = `meme-${user.id}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('memes')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(fileName);

      // Save meme record
      const { error: saveError } = await supabase
        .from('created_memes')
        .insert({
          template_id: selectedTemplate?.id,
          image_url: publicUrl,
          texts: texts,
          user_id: user.id
        });

      if (saveError) throw saveError;

      // Refresh recent memes
      await fetchRecentMemes();
      
      // Reset form
      setTexts([]);
      setSelectedTemplate(null);
      setCustomImage('');
    } catch (error) {
      console.error('Error saving meme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleLikeMeme = async (memeId: string) => {
    if (!user) return;

    try {
      const meme = recentMemes.find(m => m.id === memeId);
      if (!meme) return;

      if (meme.user_liked) {
        await supabase
          .from('meme_likes')
          .delete()
          .eq('meme_id', memeId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('meme_likes')
          .insert({
            meme_id: memeId,
            user_id: user.id
          });
      }

      await fetchRecentMemes();
    } catch (error) {
      console.error('Error liking meme:', error);
    }
  };

  const handleCustomImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomImage(e.target?.result as string);
      setSelectedTemplate(null);
      setTexts(['']);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Laugh className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Meme Oluşturucu</h2>
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              Popüler
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Şablonlar</TabsTrigger>
              <TabsTrigger value="custom">Özel Resim</TabsTrigger>
              <TabsTrigger value="gallery">Galeri</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              {/* Template Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Popüler Şablonlar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {POPULAR_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <img
                        src={template.image_url}
                        alt={template.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {template.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {template.usage_count} kullanım
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Text Inputs */}
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-gray-900">
                    Metinleri Düzenle
                  </h3>
                  {selectedTemplate.text_areas.map((area, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metin {index + 1}
                      </label>
                      <Input
                        value={texts[index] || ''}
                        onChange={(e) => {
                          const newTexts = [...texts];
                          newTexts[index] = e.target.value;
                          setTexts(newTexts);
                        }}
                        placeholder={area.default_text || `Metin ${index + 1}`}
                        className="w-full"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Kendi Resmini Yükle
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                    id="custom-image-upload"
                  />
                  <label
                    htmlFor="custom-image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Resim yüklemek için tıkla
                    </span>
                  </label>
                </div>
              </div>

              {customImage && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Metin Ekle
                  </h3>
                  <Input
                    value={texts[0] || ''}
                    onChange={(e) => setTexts([e.target.value])}
                    placeholder="Meme metni"
                    className="w-full"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Son Oluşturulan Meme'ler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentMemes.map((meme) => (
                    <Card key={meme.id} className="overflow-hidden">
                      <img
                        src={meme.image_url}
                        alt="Meme"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            @{meme.created_by.username}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeMeme(meme.id)}
                              className={meme.user_liked ? 'text-red-500' : 'text-gray-500'}
                            >
                              <Laugh className="h-4 w-4 mr-1" />
                              {meme.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <Share2 className="h-4 w-4 mr-1" />
                              {meme.shares}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Meme Preview and Actions */}
      {(selectedTemplate || customImage) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canvas Preview */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Önizleme</h3>
            <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-300 rounded"
              />
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">İşlemler</h3>
            <div className="space-y-4">
              <Button
                onClick={handleSaveMeme}
                disabled={loading || !user}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Paylaş'}
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setTexts([]);
                  setSelectedTemplate(null);
                  setCustomImage('');
                }}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Sıfırla
              </Button>

              {!user && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Meme'ini kaydetmek için giriş yap
                  </p>
                  <Button size="sm" asChild>
                    <a href="/auth/login">Giriş Yap</a>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}