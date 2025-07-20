'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Copy, 
  Check, 
  Users, 
  Calendar,
  Shield,
  AlertCircle,
  Gift,
  X,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';

interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  used_by: {
    id: string;
    username: string;
    created_at: string;
  }[];
}

interface InviteSystemProps {
  mode: 'validate' | 'manage';
  onValidCode?: (code: string) => void;
}

export function InviteSystem({ mode, onValidCode }: InviteSystemProps) {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxUses, setMaxUses] = useState(5);
  const [expiryDays, setExpiryDays] = useState(30);
  
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (mode === 'manage' && user) {
      fetchInviteCodes();
    }
  }, [mode, user]);

  const fetchInviteCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select(`
          *,
          invite_uses(
            profiles(username),
            created_at
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedCodes = (data || []).map((code: any) => ({
        id: code.id,
        code: code.code,
        created_by: code.created_by,
        max_uses: code.max_uses,
        current_uses: code.invite_uses?.length || 0,
        expires_at: code.expires_at,
        is_active: code.is_active,
        created_at: code.created_at,
        used_by: code.invite_uses?.map((use: any) => ({
          id: use.user_id,
          username: use.profiles.username,
          created_at: use.created_at
        })) || []
      }));

      setInviteCodes(processedCodes);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
    }
  };

  const validateInviteCode = async () => {
    if (!inputCode.trim()) {
      setError('Lütfen davet kodunu girin');
      return;
    }

    setValidating(true);
    setError('');

    try {
      // Check if code exists and is valid
      const { data: codeData, error: codeError } = await supabase
        .from('invite_codes')
        .select(`
          *,
          invite_uses(count)
        `)
        .eq('code', inputCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        setError('Geçersiz davet kodu');
        return;
      }

      // Check if code is expired
      if (new Date(codeData.expires_at) < new Date()) {
        setError('Bu davet kodunun süresi dolmuş');
        return;
      }

      // Check if code has reached max uses
      const currentUses = codeData.invite_uses?.length || 0;
      if (currentUses >= codeData.max_uses) {
        setError('Bu davet kodu kullanım limitine ulaşmış');
        return;
      }

      // Code is valid
      setSuccess('Davet kodu geçerli! Kayıt işlemine devam edebilirsiniz.');
      if (onValidCode) {
        onValidCode(inputCode.trim().toUpperCase());
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
      setError('Davet kodu doğrulanırken bir hata oluştu');
    } finally {
      setValidating(false);
    }
  };

  const createInviteCode = async () => {
    if (!user) return;

    setCreating(true);
    try {
      // Generate random code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Set expiry based on selected days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          created_by: user.id,
          max_uses: maxUses,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (error) throw error;

      setSuccess('Yeni davet kodu oluşturuldu!');
      setShowCreateModal(false);
      await fetchInviteCodes();
    } catch (error) {
      console.error('Error creating invite code:', error);
      setError('Davet kodu oluşturulurken bir hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const deactivateCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;

      await fetchInviteCodes();
    } catch (error) {
      console.error('Error deactivating code:', error);
    }
  };

  if (mode === 'validate') {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Key className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Davet Kodu Gerekli
          </h2>
          <p className="text-gray-600">
            Bu platforma katılmak için geçerli bir davet koduna ihtiyacınız var
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Davet Kodu
            </label>
            <Input
              type="text"
              placeholder="Davet kodunuzu girin"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError('');
                setSuccess('');
              }}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <Button
            onClick={validateInviteCode}
            disabled={validating || !inputCode.trim()}
            className="w-full"
          >
            {validating ? 'Doğrulanıyor...' : 'Davet Kodunu Doğrula'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Neden davet kodu?</p>
              <p>
                Platformumuzun kalitesini korumak ve güvenli bir ortam sağlamak için 
                sadece davet edilen kullanıcılar katılabilir.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Gift className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Davet Kodu Yönetimi</h1>
              </div>
              <p className="text-green-100 text-lg">
                Arkadaşlarını platforma davet et
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kod Oluştur
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="h-4 w-4" />
            <span>{success}</span>
          </div>
        </Card>
      )}

      {/* Invite Codes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inviteCodes.map((code, index) => (
          <motion.div
            key={code.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 ${!code.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Key className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-mono text-xl font-bold text-gray-900">
                      {code.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(code.created_at)} tarihinde oluşturuldu
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code.code)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedCode === code.code ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {code.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deactivateCode(code.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Devre Dışı Bırak
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kullanım:</span>
                  <span className="font-medium">
                    {code.current_uses} / {code.max_uses}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Son kullanma:</span>
                  <span className="font-medium">
                    {formatDate(code.expires_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Durum:</span>
                  <Badge 
                    variant={code.is_active ? 'success' : 'secondary'}
                  >
                    {code.is_active ? 'Aktif' : 'Devre Dışı'}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(code.current_uses / code.max_uses) * 100}%`
                    }}
                  />
                </div>

                {/* Used By */}
                {code.used_by.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">
                      Kullananlar:
                    </div>
                    <div className="space-y-1">
                      {code.used_by.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium">{user.username}</span>
                          <span className="text-gray-500">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      ))}
                      {code.used_by.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{code.used_by.length - 3} kişi daha
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {inviteCodes.length === 0 && (
        <Card className="p-8 text-center">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz davet kodunuz yok
          </h3>
          <p className="text-gray-600 mb-4">
            Arkadaşlarınızı platforma davet etmek için yeni bir kod oluşturun
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            İlk Davet Kodunu Oluştur
          </Button>
        </Card>
      )}
      
      {/* Davet Kodu Oluşturma Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Davet Kodu Oluştur</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Maksimum Kullanım Sayısı: {maxUses}
              </label>
              <Slider
                value={[maxUses]}
                min={1}
                max={1000}
                step={1}
                onValueChange={(value) => setMaxUses(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>250</span>
                <span>500</span>
                <span>750</span>
                <span>1000</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Geçerlilik Süresi: {expiryDays} gün
              </label>
              <Slider
                value={[expiryDays]}
                min={1}
                max={365}
                step={1}
                onValueChange={(value) => setExpiryDays(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 gün</span>
                <span>30 gün</span>
                <span>90 gün</span>
                <span>180 gün</span>
                <span>365 gün</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p>
                    Bu davet kodu <strong>{maxUses}</strong> kişi tarafından kullanılabilecek ve <strong>{expiryDays}</strong> gün boyunca geçerli olacak.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={createInviteCode}
              disabled={creating}
            >
              {creating ? 'Oluşturuluyor...' : 'Davet Kodu Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}