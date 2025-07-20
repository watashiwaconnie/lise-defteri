import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { ProfileSetupWizard } from '@/components/profile/profile-setup-wizard';
import { LoadingPage } from '@/components/ui/loading-spinner';

export default async function ProfileSetupPage() {
  const userData = await getCurrentUser();
  
  if (!userData?.user) {
    redirect('/auth/login');
  }

  // If profile is already complete, redirect to profile page
  if (userData.profile?.interests && userData.profile.interests.length > 0) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Profilini Tamamla
            </h1>
            <p className="text-lg text-gray-600">
              Seni daha iyi tanıyabilmemiz için birkaç soruya cevap ver
            </p>
          </div>
          
          <Suspense fallback={<LoadingPage />}>
            <ProfileSetupWizard user={userData.user} profile={userData.profile} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}