'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TestResponse } from '@/types';
import { getScoreBandLabel, getScoreBandDescription } from '@/lib/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TestResponse | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from sessionStorage on mount
    const storedResult = sessionStorage.getItem('testResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      router.push('/');
    }
    setMounted(true);
  }, [router]);

  const handleSubscribe = async () => {
    // Prevent multiple submissions
    if (!result || isSubscribing || isSubscribed) return;

    setIsSubscribing(true);

    try {
      const response = await fetch('/api/subscribe-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          location: result.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsSubscribed(true);
      toast.success('Welcome aboard!', {
        description: 'Check your inbox for your first founder lesson',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error('Oops!', {
        description: errorMessage,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!mounted || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const scoreBandLabel = getScoreBandLabel(result.scoreBand);
  const scoreBandDescription = getScoreBandDescription(result.scoreBand);

  // Determine badge variant based on score band
  const getBadgeVariant = () => {
    switch (result.scoreBand) {
      case 'ready':
        return 'default';
      case 'strong':
        return 'secondary';
      case 'developing':
        return 'secondary';
      case 'early-stage':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logos/founder-groundworks-transparent-blue.png"
            alt="Founder Groundworks"
            width={200}
            height={64}
            className="dark:hidden"
          />
          <Image
            src="/logos/founder-groundworks-transparent-white.png"
            alt="Founder Groundworks"
            width={200}
            height={64}
            className="hidden dark:block"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
            Your Founder Readiness Score
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Hi {result.firstName}, here are your results
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-6 md:mb-8 shadow-xl">
          <CardContent className="p-6 md:p-12">
            {/* Base Score */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-block">
                <div className="relative">
                  <svg className="w-40 h-40 md:w-56 md:h-56" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-muted"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      strokeDasharray={`${(result.baseScore / 100) * 502.65} 502.65`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-bold">
                        {result.baseScore}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">out of 100</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 md:my-8" />

            {/* Score Band */}
            <div className="text-center mb-6 md:mb-8">
              <Badge variant={getBadgeVariant()} className="text-base md:text-lg px-4 md:px-6 py-1.5 md:py-2 mb-3 md:mb-4">
                {scoreBandLabel}
              </Badge>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-2">
                {scoreBandDescription}
              </p>
            </div>

            <Separator className="my-6 md:my-8" />

            {/* CTA or High Scorer Message */}
            {result.baseScore >= 87 ? (
              <div className="text-center space-y-3 md:space-y-4 px-4">
                <h3 className="text-lg md:text-xl font-semibold">
                  You&apos;re already founder-ready.
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  Your score indicates you&apos;ve already developed the core competencies this program teaches. Our curriculum is designed for founders earlier in their journey who are building these fundamentals. You&apos;re beyond our target scope.
                </p>
              </div>
            ) : !isSubscribed ? (
              <div className="text-center space-y-3 md:space-y-4">
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || isSubscribed}
                  size="lg"
                  className="text-xs md:text-base px-4 md:px-8 py-4 md:py-6 rounded-full shadow-lg w-full md:w-auto leading-tight disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing
                    ? 'Subscribing...'
                    : 'Send me founder lessons to improve my score'}
                </Button>
                <p className="text-xs md:text-sm text-muted-foreground px-2">
                  Get personalized lessons delivered to your inbox
                </p>
              </div>
            ) : (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300 font-semibold ml-2">
                  You&apos;re all set! Check your inbox for your first founder lesson.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Your Learning Preferences</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-foreground font-semibold">Preferred learning format:</span>
              <Badge variant="default" className="capitalize">
                {result.q10}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
