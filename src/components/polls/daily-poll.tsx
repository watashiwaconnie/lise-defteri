'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp,
  Vote,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';
import { formatRelativeTime } from '@/lib/utils';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  expires_at: string;
  created_at: string;
  user_voted: boolean;
  user_vote_option?: string;
  category: string;
  is_featured: boolean;
}

export function DailyPoll() {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchDailyPoll();
  }, []);

  const fetchDailyPoll = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_polls')
        .select(`
          *,
          poll_options(*),
          poll_votes(option_id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        // Calculate vote statistics
        const totalVotes = data.poll_votes?.length || 0;
        const options = data.poll_options?.map((option: any) => {
          const votes = data.poll_votes?.filter((vote: any) => vote.option_id === option.id).length || 0;
          return {
            id: option.id,
            text: option.text,
            votes,
            percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0
          };
        }) || [];

        // Check if user has voted
        let userVoted = false;
        let userVoteOption = '';
        if (user) {
          const { data: userVote } = await supabase
            .from('poll_votes')
            .select('option_id')
            .eq('poll_id', data.id)
            .eq('user_id', user.id)
            .single();
          
          if (userVote) {
            userVoted = true;
            userVoteOption = userVote.option_id;
          }
        }

        setCurrentPoll({
          id: data.id,
          question: data.question,
          description: data.description,
          options,
          total_votes: totalVotes,
          expires_at: data.expires_at,
          created_at: data.created_at,
          user_voted: userVoted,
          user_vote_option: userVoteOption,
          category: data.category,
          is_featured: data.is_featured
        });
      }
    } catch (error) {
      console.error('Error fetching daily poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!user || voting || currentPoll?.user_voted) return;

    setVoting(true);
    try {
      if (!currentPoll) {
        throw new Error('No active poll found');
      }
      
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: currentPoll.id,
          option_id: optionId,
          user_id: user.id
        });

      if (error) throw error;

      // Refresh poll data
      await fetchDailyPoll();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const isExpired = currentPoll ? new Date(currentPoll.expires_at) < new Date() : false;
  const timeLeft = currentPoll ? new Date(currentPoll.expires_at).getTime() - new Date().getTime() : 0;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!currentPoll) {
    return (
      <Card className="p-6 text-center">
        <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bugün için anket yok
        </h3>
        <p className="text-gray-600">
          Yeni anketler için geri gel!
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Günün Anketi</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{currentPoll.total_votes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{isExpired ? 'Süresi doldu' : `${hoursLeft}s kaldı`}</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2">
          {currentPoll.question}
        </h2>
        
        {currentPoll.description && (
          <p className="text-white/80 text-sm">
            {currentPoll.description}
          </p>
        )}

        {currentPoll.is_featured && (
          <Badge variant="secondary" className="mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            Öne Çıkan
          </Badge>
        )}
      </div>

      {/* Poll Options */}
      <div className="p-6 space-y-3">
        <AnimatePresence>
          {currentPoll.options.map((option, index) => {
            const isSelected = currentPoll.user_vote_option === option.id;
            const canVote = !currentPoll.user_voted && !isExpired && user;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  canVote 
                    ? 'border-gray-200 hover:border-primary-300 cursor-pointer hover:shadow-sm' 
                    : 'border-gray-200'
                } ${isSelected ? 'border-primary-500 bg-primary-50' : 'bg-white'}`}
                onClick={() => canVote && handleVote(option.id)}
              >
                {/* Progress Background */}
                {currentPoll.user_voted && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-primary-100 to-transparent transition-all duration-1000"
                    style={{ width: `${option.percentage}%` }}
                  />
                )}

                <div className="relative p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {option.text}
                    </span>
                  </div>

                  {currentPoll.user_voted && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{option.votes} oy</span>
                      <span className="font-semibold">
                        %{Math.round(option.percentage)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Vote Button for Non-logged Users */}
        {!user && (
          <div className="text-center pt-4">
            <p className="text-gray-600 mb-3">Oy vermek için giriş yapın</p>
            <Button asChild>
              <a href="/auth/login">Giriş Yap</a>
            </Button>
          </div>
        )}

        {/* Results Summary */}
        {currentPoll.user_voted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t border-gray-200"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Toplam {currentPoll.total_votes} oy</span>
              <span>Oy verdin ✓</span>
            </div>
            
            {/* Top Option */}
            {currentPoll.options.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-600">En popüler: </span>
                <span className="font-semibold text-primary-600">
                  {currentPoll.options.reduce((prev, current) => 
                    prev.votes > current.votes ? prev : current
                  ).text}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}