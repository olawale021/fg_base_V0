import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

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

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  base_score: number | null;
  latest_score: number | null;
  latest_score_band: string | null;
  assessment_count: number | null;
  created_at: string;
  current_streak_days: number | null;
  longest_streak_days: number | null;
  total_content_completed: number | null;
  total_learning_minutes: number | null;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  content_slug: string;
  status: string;
  completed_at: string | null;
  time_spent_seconds: number;
  read_count: number;
  last_read_at: string | null;
  created_at: string;
}

export interface UserWithAttempts {
  user: User;
  attempts: TestResponse[];
  lessonCompletions: LessonCompletion[];
}

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  format: 'lesson' | 'article' | 'story' | 'debate' | 'conversation';
  content: {
    intro: string;
    quickBreakdown: { title: string; description: string }[];
    rememberThis: { title: string; content: string };
  };
  category_slug: string;
  tags: string[];
  is_premium: boolean;
  estimated_duration_minutes: number;
  author: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
}

async function getAdminData(): Promise<{ users: UserWithAttempts[]; webResponses: TestResponse[]; contentItems: ContentItem[] }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all users with assessments
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, base_score, latest_score, latest_score_band, assessment_count, created_at, current_streak_days, longest_streak_days, total_content_completed, total_learning_minutes')
    .order('created_at', { ascending: false });

  if (usersError) {
    console.error('Error fetching users:', usersError);
  }

  // Fetch all test responses (mobile app)
  const { data: testResponses, error: testError } = await supabase
    .from('test_responses')
    .select('*')
    .order('created_at', { ascending: true });

  if (testError) {
    console.error('Error fetching test responses:', testError);
  }

  // Fetch web test responses (web app - anonymous users)
  const { data: webResponses, error: webError } = await supabase
    .from('web_test_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (webError) {
    console.error('Error fetching web test responses:', webError);
  }

  // Fetch all content items
  const { data: contentItems, error: contentError } = await supabase
    .from('content_items')
    .select('*')
    .order('display_order', { ascending: true });

  if (contentError) {
    console.error('Error fetching content items:', contentError);
  }

  // Fetch all lesson completions
  const { data: lessonCompletions, error: lessonsError } = await supabase
    .from('user_lesson_completions')
    .select('*')
    .order('completed_at', { ascending: true });

  if (lessonsError) {
    console.error('Error fetching lesson completions:', lessonsError);
  }

  // Group test responses and lesson completions by user
  const userMap = new Map<string, UserWithAttempts>();

  // Initialize with users
  (users || []).forEach((user: User) => {
    userMap.set(user.id, {
      user,
      attempts: [],
      lessonCompletions: [],
    });
  });

  // Add test responses to users
  (testResponses || []).forEach((response: TestResponse) => {
    if (response.user_id && userMap.has(response.user_id)) {
      userMap.get(response.user_id)!.attempts.push(response);
    }
  });

  // Add lesson completions to users
  (lessonCompletions || []).forEach((completion: LessonCompletion) => {
    if (completion.user_id && userMap.has(completion.user_id)) {
      userMap.get(completion.user_id)!.lessonCompletions.push(completion);
    }
  });

  // Convert to array and filter users with at least one attempt
  const usersWithAttempts = Array.from(userMap.values())
    .filter(u => u.attempts.length > 0)
    .sort((a, b) => new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime());

  return {
    users: usersWithAttempts,
    webResponses: (webResponses || []) as TestResponse[],
    contentItems: (contentItems || []) as ContentItem[],
  };
}

export default async function AdminPage() {
  const { users, webResponses, contentItems } = await getAdminData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Image
              src="/logos/founder-groundworks-transparent-blue.png"
              alt="Founder Groundworks"
              width={120}
              height={32}
              className="dark:hidden w-[100px] sm:w-[150px]"
            />
            <Image
              src="/logos/founder-groundworks-transparent-white.png"
              alt="Founder Groundworks"
              width={120}
              height={32}
              className="hidden dark:block w-[100px] sm:w-[150px]"
            />
            <div className="h-5 sm:h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-sm sm:text-lg font-semibold text-foreground hidden sm:block">Admin</h1>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            <span className="hidden sm:inline">{users.length} users · {contentItems.length} lessons</span>
            <span className="sm:hidden">{users.length} users</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <AdminDashboard users={users} webResponses={webResponses} contentItems={contentItems} />
      </main>
    </div>
  );
}
