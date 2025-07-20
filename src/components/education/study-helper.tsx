'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  HelpCircle,
  CheckCircle,
  Star,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { useSupabase } from '@/app/providers';
import { useAuth } from '@/hooks/use-auth';
import { formatRelativeTime } from '@/lib/utils';

interface StudyQuestion {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  asked_by: {
    id: string;
    username: string;
    avatar_url?: string;
    grade: number;
  };
  answers: Answer[];
  is_solved: boolean;
  views: number;
  created_at: string;
  tags: string[];
}

interface Answer {
  id: string;
  content: string;
  is_accepted: boolean;
  is_helpful: boolean;
  answered_by: {
    id: string;
    username: string;
    avatar_url?: string;
    expert_subjects: string[];
  };
  votes: number;
  user_voted: boolean;
  created_at: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  target_exam: string;
  exam_date: string;
  max_members: number;
  current_members: number;
  created_by: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  members: {
    id: string;
    username: string;
    avatar_url?: string;
    role: 'admin' | 'member';
  }[];
  is_member: boolean;
  created_at: string;
}

interface StudyNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: number;
  file_url?: string;
  shared_by: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  downloads: number;
  rating: number;
  reviews: number;
  created_at: string;
  tags: string[];
}

const SUBJECTS = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 
  'Tarih', 'Coğrafya', 'Felsefe', 'İngilizce', 'Edebiyat'
];

const GRADES = [9, 10, 11, 12];

export function StudyHelper() {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedSubject, selectedGrade]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'questions':
          await fetchQuestions();
          break;
        case 'groups':
          await fetchStudyGroups();
          break;
        case 'notes':
          await fetchStudyNotes();
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    let query = supabase
      .from('study_questions')
      .select(`
        *,
        profiles(username, avatar_url, grade),
        study_answers(
          *,
          profiles(username, avatar_url, expert_subjects)
        )
      `)
      .order('created_at', { ascending: false });

    if (selectedSubject) {
      query = query.eq('subject', selectedSubject);
    }
    if (selectedGrade) {
      query = query.eq('grade', selectedGrade);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;

    const processedQuestions = await Promise.all(
      (data || []).map(async (q: any) => {
        const answers = await Promise.all(
          (q.study_answers || []).map(async (answer: any) => {
            const { data: votes } = await supabase
              .from('answer_votes')
              .select('id')
              .eq('answer_id', answer.id);

            let userVoted = false;
            if (user) {
              const { data: userVote } = await supabase
                .from('answer_votes')
                .select('id')
                .eq('answer_id', answer.id)
                .eq('user_id', user.id)
                .single();
              userVoted = !!userVote;
            }

            return {
              id: answer.id,
              content: answer.content,
              is_accepted: answer.is_accepted,
              is_helpful: answer.is_helpful,
              answered_by: {
                id: answer.user_id,
                username: answer.profiles.username,
                avatar_url: answer.profiles.avatar_url,
                expert_subjects: answer.profiles.expert_subjects || []
              },
              votes: votes?.length || 0,
              user_voted: userVoted,
              created_at: answer.created_at
            };
          })
        );

        return {
          id: q.id,
          title: q.title,
          content: q.content,
          subject: q.subject,
          grade: q.grade,
          difficulty: q.difficulty,
          asked_by: {
            id: q.user_id,
            username: q.profiles.username,
            avatar_url: q.profiles.avatar_url,
            grade: q.profiles.grade
          },
          answers: answers.sort((a, b) => b.votes - a.votes),
          is_solved: q.is_solved,
          views: q.views || 0,
          created_at: q.created_at,
          tags: q.tags || []
        };
      })
    );

    setQuestions(processedQuestions);
  };

  const fetchStudyGroups = async () => {
    let query = supabase
      .from('study_groups')
      .select(`
        *,
        profiles(username, avatar_url),
        study_group_members(
          profiles(username, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (selectedSubject) {
      query = query.eq('subject', selectedSubject);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;

    const processedGroups = await Promise.all(
      (data || []).map(async (group: any) => {
        let isMember = false;
        if (user) {
          const { data: membership } = await supabase
            .from('study_group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .single();
          isMember = !!membership;
        }

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          subject: group.subject,
          target_exam: group.target_exam,
          exam_date: group.exam_date,
          max_members: group.max_members,
          current_members: group.study_group_members?.length || 0,
          created_by: {
            id: group.created_by,
            username: group.profiles.username,
            avatar_url: group.profiles.avatar_url
          },
          members: group.study_group_members?.map((member: any) => ({
            id: member.user_id,
            username: member.profiles.username,
            avatar_url: member.profiles.avatar_url,
            role: member.role
          })) || [],
          is_member: isMember,
          created_at: group.created_at
        };
      })
    );

    setStudyGroups(processedGroups);
  };

  const fetchStudyNotes = async () => {
    let query = supabase
      .from('study_notes')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (selectedSubject) {
      query = query.eq('subject', selectedSubject);
    }
    if (selectedGrade) {
      query = query.eq('grade', selectedGrade);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;

    const processedNotes = (data || []).map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      subject: note.subject,
      grade: note.grade,
      file_url: note.file_url,
      shared_by: {
        id: note.user_id,
        username: note.profiles.username,
        avatar_url: note.profiles.avatar_url
      },
      downloads: note.downloads || 0,
      rating: note.rating || 0,
      reviews: note.reviews || 0,
      created_at: note.created_at,
      tags: note.tags || []
    }));

    setStudyNotes(processedNotes);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;
      await fetchStudyGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleVoteAnswer = async (answerId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('answer_votes')
        .insert({
          answer_id: answerId,
          user_id: user.id
        });

      if (error) throw error;
      await fetchQuestions();
    } catch (error) {
      console.error('Error voting answer:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Eğitim Destek Merkezi</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Ders sorularını sor, çalışma gruplarına katıl, notları paylaş
          </p>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tüm Dersler</option>
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={selectedGrade || ''}
            onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tüm Sınıflar</option>
            {GRADES.map(grade => (
              <option key={grade} value={grade}>{grade}. Sınıf</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Sorular</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Çalışma Grupları</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Ders Notları</span>
          </TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {question.title}
                        </h3>
                        {question.is_solved && (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Çözüldü
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Avatar
                            src={question.asked_by.avatar_url}
                            alt={question.asked_by.username}
                            fallback={question.asked_by.username[0]?.toUpperCase()}
                            size="xs"
                          />
                          <span>{question.asked_by.username}</span>
                          <span>•</span>
                          <span>{question.asked_by.grade}. Sınıf</span>
                        </div>
                        <span>•</span>
                        <span>{formatRelativeTime(question.created_at)}</span>
                        <span>•</span>
                        <span>{question.views} görüntüleme</span>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {question.content}
                      </p>

                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {getDifficultyText(question.difficulty)}
                        </Badge>
                        {question.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {question.answers.length}
                      </div>
                      <div className="text-xs text-gray-500">cevap</div>
                    </div>
                  </div>

                  {/* Best Answer Preview */}
                  {question.answers.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-start space-x-3">
                        <Avatar
                          src={question.answers[0].answered_by.avatar_url}
                          alt={question.answers[0].answered_by.username}
                          fallback={question.answers[0].answered_by.username[0]?.toUpperCase()}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {question.answers[0].answered_by.username}
                            </span>
                            {question.answers[0].answered_by.expert_subjects.includes(question.subject) && (
                              <Badge variant="success" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Uzman
                              </Badge>
                            )}
                            {question.answers[0].is_accepted && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Kabul Edildi
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {question.answers[0].content}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVoteAnswer(question.answers[0].id)}
                              disabled={!user || question.answers[0].user_voted}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              {question.answers[0].votes}
                            </Button>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(question.answers[0].created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGroups.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {group.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {group.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{group.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>{group.target_exam}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(group.exam_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{group.current_members}/{group.max_members} üye</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={group.created_by.avatar_url}
                        alt={group.created_by.username}
                        fallback={group.created_by.username[0]?.toUpperCase()}
                        size="xs"
                      />
                      <span className="text-xs text-gray-500">
                        {group.created_by.username}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={!user || group.is_member || group.current_members >= group.max_members}
                    >
                      {group.is_member ? 'Üyesin' : 'Katıl'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Study Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyNotes.map((note) => (
                <Card key={note.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">{note.subject}</Badge>
                      <Badge variant="secondary">{note.grade}. Sınıf</Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {note.content}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{note.rating.toFixed(1)}</span>
                        <span>({note.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{note.downloads} indirme</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={note.shared_by.avatar_url}
                        alt={note.shared_by.username}
                        fallback={note.shared_by.username[0]?.toUpperCase()}
                        size="xs"
                      />
                      <span className="text-xs text-gray-500">
                        {note.shared_by.username}
                      </span>
                    </div>

                    <Button size="sm" variant="outline">
                      İndir
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}