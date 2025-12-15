'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QuestionCard from '@/components/QuestionCard';
import UserInfoForm from '@/components/UserInfoForm';
import { questions } from '@/lib/questions';
import { TestAnswers, UserInfo } from '@/types';
import { calculateScore } from '@/lib/scoring';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<TestAnswers>>({});
  const [showUserForm, setShowUserForm] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStep];

  const handleSelect = (value: number | string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    } as Partial<TestAnswers>);
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All questions answered, show user info form
      setShowUserForm(true);
    }
  };

  const handleBack = () => {
    if (showUserForm) {
      setShowUserForm(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUserInfoSubmit = async (userInfo: UserInfo) => {
    // Calculate score
    const scoreResult = calculateScore(answers as TestAnswers);

    // Prepare complete response
    const testResponse = {
      ...userInfo,
      ...answers,
      baseScore: scoreResult.baseScore,
      scoreBand: scoreResult.scoreBand,
    };

    // Store in sessionStorage to pass to results page
    sessionStorage.setItem('testResult', JSON.stringify(testResponse));

    // TODO: Submit to API when backend is ready
    // await fetch('/api/submit-test', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(testResponse),
    // });

    // Navigate to results
    router.push('/results');
  };

  const currentAnswer = answers[currentQuestion?.id];
  const canProceed = currentAnswer !== undefined;

  if (showUserForm) {
    return (
      <div className="min-h-screen bg-background pt-2 md:pt-4 pb-4 md:pb-6 px-4">
        {/* Logo */}
        <div className="max-w-2xl mx-auto mb-2 flex justify-center">
          <Image
            src="/logos/Founder Groundworks Transparent Blue.png"
            alt="Founder Groundworks"
            width={200}
            height={64}
            className="dark:hidden"
          />
          <Image
            src="/logos/Founder Groundworks Transparent White.png"
            alt="Founder Groundworks"
            width={200}
            height={64}
            className="hidden dark:block"
          />
        </div>
        <UserInfoForm onSubmit={handleUserInfoSubmit} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-2 md:pt-4 pb-4 md:pb-6 px-4">
      {/* Logo */}
      <div className="max-w-2xl mx-auto mb-2 flex justify-center">
        <Image
          src="/logos/Founder Groundworks Transparent Blue.png"
          alt="Founder Groundworks"
          width={200}
          height={64}
          className="dark:hidden"
        />
        <Image
          src="/logos/Founder Groundworks Transparent White.png"
          alt="Founder Groundworks"
          width={200}
          height={64}
          className="hidden dark:block"
        />
      </div>

      <QuestionCard
        question={currentQuestion}
        currentQuestion={currentStep + 1}
        totalQuestions={totalQuestions}
        selectedValue={currentAnswer}
        onSelect={handleSelect}
      />

      {/* Navigation */}
      <div className="max-w-2xl mx-auto mt-6 md:mt-8 flex justify-between items-center">
        <Button
          onClick={handleBack}
          disabled={currentStep === 0}
          variant="ghost"
          size="lg"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
        >
          {currentStep === totalQuestions - 1 ? 'Continue' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
