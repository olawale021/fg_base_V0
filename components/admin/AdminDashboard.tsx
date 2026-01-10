'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, User, TrendingUp, TrendingDown, Minus, BookOpen, Plus, FileText, Users, Globe, Clock, Flame, CheckCircle2, Circle } from 'lucide-react';
import type { UserWithAttempts, ContentItem, LessonCompletion } from '@/app/admin/page';
import { ContentManager } from './ContentManager';

interface TestResponse {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  base_score: number;
  score_band: string;
  is_retake: boolean | null;
  attempt_number: number | null;
  previous_score: number | null;
  score_change: number | null;
  lessons_completed_at_assessment: number | null;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string | null;
  q6: string | null;
  q7: string | null;
  q8: string | null;
  q9: string | null;
  q10: string | null;
  prev_q1: string | null;
  prev_q2: string | null;
  prev_q3: string | null;
  prev_q4: string | null;
  prev_q5: string | null;
  prev_q6: string | null;
  prev_q7: string | null;
  prev_q8: string | null;
  prev_q9: string | null;
  prev_q10: string | null;
}

interface AdminDashboardProps {
  users: UserWithAttempts[];
  webResponses: TestResponse[];
  contentItems: ContentItem[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getScoreBandColor(band: string): string {
  switch (band) {
    case 'ready':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'strong':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'developing':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'early-stage':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

function ScoreChangeIndicator({ change }: { change: number | null }) {
  if (change === null) return null;

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
        <TrendingUp className="size-4" />
        +{change}
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
        <TrendingDown className="size-4" />
        {change}
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
        <Minus className="size-4" />
        0
      </span>
    );
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

function UserRow({ userData }: { userData: UserWithAttempts }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'assessments' | 'lessons'>('assessments');
  const { user, attempts, lessonCompletions } = userData;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  const attemptCount = attempts.length;
  const latestAttempt = attempts[attempts.length - 1];

  // Calculate total improvement (latest score - base score, includes lesson points)
  const baseScore = user.base_score ?? 0;
  const latestScore = user.latest_score ?? user.base_score ?? 0;
  const totalImprovement = latestScore - baseScore;

  const completedLessons = lessonCompletions.filter(l => l.status === 'completed');
  const totalTimeSpent = lessonCompletions.reduce((sum, l) => sum + (l.time_spent_seconds || 0), 0);

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* User Header Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-3 sm:px-4 hover:bg-accent/50 transition-colors text-left"
      >
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
            </div>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{fullName}</div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{baseScore}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-lg font-bold text-foreground">{latestScore}</span>
              {totalImprovement > 0 && (
                <span className="text-sm text-green-600 font-medium">+{totalImprovement}</span>
              )}
            </div>
            <Badge variant="outline" className={`${getScoreBandColor(user.latest_score_band || latestAttempt?.score_band || '')} text-xs`}>
              {(user.latest_score_band || latestAttempt?.score_band || 'unknown').replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-3 pl-8 text-xs text-muted-foreground">
            <span>{attemptCount} assessment{attemptCount !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{completedLessons.length} lesson{completedLessons.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{fullName}</div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Base Score */}
            <div className="text-center hidden md:block">
              <div className="text-lg font-medium text-muted-foreground">
                {baseScore || '-'}
              </div>
              <div className="text-xs text-muted-foreground">Base</div>
            </div>

            {/* Arrow */}
            <div className="text-muted-foreground hidden md:block">→</div>

            {/* Current Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {latestScore || '-'}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>

            {/* Total Improvement */}
            {totalImprovement !== 0 && (
              <div className="text-center hidden lg:block">
                <ScoreChangeIndicator change={totalImprovement} />
                <div className="text-xs text-muted-foreground">Gain</div>
              </div>
            )}

            <Badge variant="outline" className={getScoreBandColor(user.latest_score_band || latestAttempt?.score_band || '')}>
              {(user.latest_score_band || latestAttempt?.score_band || 'unknown').replace('-', ' ')}
            </Badge>

            <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
              <span>{attemptCount} assessment{attemptCount !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{completedLessons.length} lesson{completedLessons.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t bg-muted/30">
          {/* User Stats Bar */}
          <div className="px-3 sm:px-4 py-3 bg-muted/20 border-b grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-orange-500" />
              <span className="text-xs sm:text-sm">
                <span className="font-medium">{user.current_streak_days || 0}</span>
                <span className="text-muted-foreground"> streak</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm">
                <span className="font-medium">{user.longest_streak_days || 0}</span>
                <span className="text-muted-foreground"> best</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-blue-500" />
              <span className="text-xs sm:text-sm">
                <span className="font-medium">{user.total_learning_minutes || Math.round(totalTimeSpent / 60)}</span>
                <span className="text-muted-foreground"> min</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-green-500" />
              <span className="text-xs sm:text-sm">
                <span className="font-medium">{user.total_content_completed || completedLessons.length}</span>
                <span className="text-muted-foreground"> done</span>
              </span>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="px-3 sm:px-4 py-2 border-b flex gap-2">
            <Button
              variant={activeSection === 'assessments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection('assessments')}
              className="text-xs sm:text-sm"
            >
              Assessments ({attemptCount})
            </Button>
            <Button
              variant={activeSection === 'lessons' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection('lessons')}
              className="text-xs sm:text-sm"
            >
              Lessons ({lessonCompletions.length})
            </Button>
          </div>

          {/* Assessments Section */}
          {activeSection === 'assessments' && (
            <>
              {/* Desktop Header */}
              <div className="hidden md:block px-4 py-2 bg-muted/50 border-b">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase">
                  <div className="col-span-1">Attempt</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Score</div>
                  <div className="col-span-2">Change</div>
                  <div className="col-span-2">Band</div>
                  <div className="col-span-3">Lessons</div>
                </div>
              </div>
              {attempts.map((attempt, index) => (
                <AttemptRow key={attempt.id} attempt={attempt} index={index} />
              ))}
            </>
          )}

          {/* Lessons Section */}
          {activeSection === 'lessons' && (
            <>
              {/* Desktop Header */}
              <div className="hidden md:block px-4 py-2 bg-muted/50 border-b">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase">
                  <div className="col-span-1">Status</div>
                  <div className="col-span-4">Lesson</div>
                  <div className="col-span-2">Completed</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Reads</div>
                  <div className="col-span-1">Last</div>
                </div>
              </div>
              {lessonCompletions.length > 0 ? (
                lessonCompletions.map((lesson) => (
                  <LessonRow key={lesson.id} lesson={lesson} />
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No lessons started yet
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LessonRow({ lesson }: { lesson: LessonCompletion }) {
  const isCompleted = lesson.status === 'completed';

  return (
    <div className="px-3 sm:px-4 py-3 border-b last:border-b-0 hover:bg-accent/30">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="size-5 text-green-500 shrink-0" />
          ) : (
            <Circle className="size-5 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground">
            {lesson.content_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
        <div className="flex items-center gap-4 pl-8 text-xs text-muted-foreground">
          <span>Time: {formatDuration(lesson.time_spent_seconds || 0)}</span>
          <span>·</span>
          <span>Read: {lesson.read_count || 1}x</span>
          {lesson.completed_at && (
            <>
              <span>·</span>
              <span>{formatDate(lesson.completed_at)}</span>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1">
          {isCompleted ? (
            <CheckCircle2 className="size-5 text-green-500" />
          ) : (
            <Circle className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="col-span-4">
          <span className="text-sm font-medium text-foreground">
            {lesson.content_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          <Badge variant="outline" className="ml-2 text-xs">
            {lesson.status}
          </Badge>
        </div>

        <div className="col-span-2 text-sm text-muted-foreground">
          {lesson.completed_at ? formatDate(lesson.completed_at) : '—'}
        </div>

        <div className="col-span-2 text-sm text-muted-foreground">
          {formatDuration(lesson.time_spent_seconds || 0)}
        </div>

        <div className="col-span-2 text-sm text-muted-foreground">
          {lesson.read_count || 1}x
        </div>

        <div className="col-span-1 text-sm text-muted-foreground">
          {lesson.last_read_at ? formatDate(lesson.last_read_at) : '—'}
        </div>
      </div>
    </div>
  );
}

function AttemptRow({ attempt, index }: { attempt: TestResponse; index: number }) {
  const [showAnswers, setShowAnswers] = useState(false);

  const questions = [
    { id: 'q1', label: 'Problem solving' },
    { id: 'q2', label: 'Vision clarity' },
    { id: 'q3', label: 'Customer understanding' },
    { id: 'q4', label: 'Team building' },
    { id: 'q5', label: 'Financial planning' },
    { id: 'q6', label: 'Market knowledge' },
    { id: 'q7', label: 'Resilience' },
    { id: 'q8', label: 'Networking' },
    { id: 'q9', label: 'Execution speed' },
    { id: 'q10', label: 'Learning format' },
  ];

  return (
    <div className="border-b last:border-b-0">
      <div
        className="px-3 sm:px-4 py-3 hover:bg-accent/30 cursor-pointer"
        onClick={() => setShowAnswers(!showAnswers)}
      >
        {/* Mobile Layout */}
        <div className="flex flex-col gap-2 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                #{attempt.attempt_number || index + 1}
              </span>
              {attempt.is_retake && (
                <Badge variant="secondary" className="text-xs">Retake</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(attempt.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{attempt.base_score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
              {attempt.is_retake && attempt.score_change !== null && (
                <ScoreChangeIndicator change={attempt.score_change} />
              )}
            </div>
            <Badge variant="outline" className={`${getScoreBandColor(attempt.score_band)} text-xs`}>
              {attempt.score_band.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1">
            <span className="text-sm font-medium text-foreground">
              #{attempt.attempt_number || index + 1}
            </span>
            {attempt.is_retake && (
              <Badge variant="secondary" className="ml-2 text-xs">Retake</Badge>
            )}
          </div>

          <div className="col-span-2 text-sm text-muted-foreground">
            {formatDate(attempt.created_at)}
          </div>

          <div className="col-span-2">
            <span className="text-lg font-semibold text-foreground">{attempt.base_score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>

          <div className="col-span-2">
            {attempt.is_retake ? (
              <ScoreChangeIndicator change={attempt.score_change} />
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>

          <div className="col-span-2">
            <Badge variant="outline" className={getScoreBandColor(attempt.score_band)}>
              {attempt.score_band.replace('-', ' ')}
            </Badge>
          </div>

          <div className="col-span-3 flex items-center gap-2">
            {attempt.lessons_completed_at_assessment !== null && (
              <>
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {attempt.lessons_completed_at_assessment} lessons
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Answer Details */}
      {showAnswers && (
        <div className="px-3 sm:px-4 py-4 bg-muted/20 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {questions.map(({ id, label }) => {
              const currentAnswer = attempt[id as keyof TestResponse] as string | null;
              const prevAnswer = attempt[`prev_${id}` as keyof TestResponse] as string | null;
              const hasChanged = attempt.is_retake && prevAnswer && currentAnswer !== prevAnswer;

              return (
                <div key={id} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {id.toUpperCase()}: {label}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasChanged && prevAnswer && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          {prevAnswer}
                        </span>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <span className={`text-sm ${hasChanged ? 'text-green-600 font-medium' : 'text-foreground'}`}>
                      {currentAnswer || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WebResponseRow({ response }: { response: TestResponse }) {
  const [showDetails, setShowDetails] = useState(false);
  const fullName = `${response.first_name || ''} ${response.last_name || ''}`.trim() || 'Anonymous';

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-3 sm:px-4 py-3 hover:bg-accent/50 transition-colors text-left"
      >
        {/* Mobile Layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              {showDetails ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
            </div>
            <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{fullName}</div>
              <div className="text-sm text-muted-foreground truncate">{response.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{response.base_score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Badge variant="outline" className={`${getScoreBandColor(response.score_band)} text-xs`}>
              {response.score_band.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-muted-foreground">
            {showDetails ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <User className="size-5 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{fullName}</div>
              <div className="text-sm text-muted-foreground truncate">{response.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{response.base_score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>

            <Badge variant="outline" className={getScoreBandColor(response.score_band)}>
              {response.score_band.replace('-', ' ')}
            </Badge>

            <div className="text-sm text-muted-foreground hidden md:block">
              {formatDate(response.created_at)}
            </div>
          </div>
        </div>
      </button>

      {showDetails && (
        <div className="border-t px-3 sm:px-4 py-4 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'].map((qId) => {
              const answer = response[qId as keyof TestResponse] as string | null;
              return (
                <div key={qId} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{qId}</span>
                  <span className="text-sm text-foreground">{answer || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard({ users, webResponses, contentItems }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'mobile' | 'web' | 'content'>('mobile');

  // Calculate stats
  const totalMobileUsers = users.length;
  const totalAttempts = users.reduce((sum, u) => sum + u.attempts.length, 0);
  const avgScore = users.length > 0
    ? Math.round(users.reduce((sum, u) => sum + (u.user.latest_score ?? u.user.base_score ?? 0), 0) / users.length)
    : 0;
  const retakeCount = users.reduce((sum, u) => sum + u.attempts.filter(a => a.is_retake).length, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-6 text-center sm:text-left">
            <div className="text-[10px] sm:text-sm text-muted-foreground">Users</div>
            <div className="text-sm sm:text-3xl font-bold">{totalMobileUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6 text-center sm:text-left">
            <div className="text-[10px] sm:text-sm text-muted-foreground">Tests</div>
            <div className="text-sm sm:text-3xl font-bold">{totalAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6 text-center sm:text-left">
            <div className="text-[10px] sm:text-sm text-muted-foreground">Avg</div>
            <div className="text-sm sm:text-3xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6 text-center sm:text-left">
            <div className="text-[10px] sm:text-sm text-muted-foreground">Retakes</div>
            <div className="text-sm sm:text-3xl font-bold">{retakeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6 text-center sm:text-left">
            <div className="text-[10px] sm:text-sm text-muted-foreground">Lessons</div>
            <div className="text-sm sm:text-3xl font-bold">{contentItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto">
        <Button
          variant={activeTab === 'mobile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('mobile')}
          className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4 shrink-0"
        >
          <Users className="size-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Mobile App</span>
          <span className="sm:hidden">Mobile Users</span>
          <span className="ml-1">({totalMobileUsers})</span>
        </Button>
        <Button
          variant={activeTab === 'web' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('web')}
          className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4 shrink-0"
        >
          <Globe className="size-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Web Responses</span>
          <span className="sm:hidden">Web Tests</span>
          <span className="ml-1">({webResponses.length})</span>
        </Button>
        <Button
          variant={activeTab === 'content' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('content')}
          className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4 shrink-0"
        >
          <FileText className="size-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Content</span>
          <span className="sm:hidden">Lessons</span>
          <span className="ml-1">({contentItems.length})</span>
        </Button>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeTab === 'mobile' ? (
          users.length > 0 ? (
            users.map((userData) => (
              <UserRow key={userData.user.id} userData={userData} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No mobile app users found
              </CardContent>
            </Card>
          )
        ) : activeTab === 'web' ? (
          webResponses.length > 0 ? (
            webResponses.map((response) => (
              <WebResponseRow key={response.id} response={response} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No web responses found
              </CardContent>
            </Card>
          )
        ) : (
          <ContentManager contentItems={contentItems} />
        )}
      </div>
    </div>
  );
}
