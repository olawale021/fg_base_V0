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
  const [questionTexts, setQuestionTexts] = useState<Record<string, string>>({});
  const [answerLabels, setAnswerLabels] = useState<Record<string, string>>({});
  const [showUserForm, setShowUserForm] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStep];

  const handleSelect = (value: number | string) => {
    // Find the label for the selected value
    const selectedOption = currentQuestion.options.find(opt => opt.value === value);
    const label = selectedOption?.label || String(value);

    // Store the answer value (for scoring)
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    } as Partial<TestAnswers>);

    // Store the question text
    setQuestionTexts({
      ...questionTexts,
      [currentQuestion.id]: currentQuestion.question,
    });

    // Store the answer label
    setAnswerLabels({
      ...answerLabels,
      [currentQuestion.id]: label,
    });
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

    // Submit to Supabase with questions and answers (don't block navigation on error)
    try {
      await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testResponse,
          // Add question texts (q1, q2, etc.)
          q1: questionTexts.q1,
          q2: questionTexts.q2,
          q3: questionTexts.q3,
          q4: questionTexts.q4,
          q5: questionTexts.q5,
          q6: questionTexts.q6,
          q7: questionTexts.q7,
          q8: questionTexts.q8,
          q9: questionTexts.q9,
          q10: questionTexts.q10,
          // Add answer labels (q1_label, q2_label, etc.)
          q1_label: answerLabels.q1,
          q2_label: answerLabels.q2,
          q3_label: answerLabels.q3,
          q4_label: answerLabels.q4,
          q5_label: answerLabels.q5,
          q6_label: answerLabels.q6,
          q7_label: answerLabels.q7,
          q8_label: answerLabels.q8,
          q9_label: answerLabels.q9,
          q10_label: answerLabels.q10,
        }),
      });
    } catch (error) {
      console.error('Failed to save test response:', error);
      // Continue to results even if save fails
    }

    // Navigate to results
    router.push('/results');
  };

  const currentAnswer = answers[currentQuestion?.id];
  const canProceed = currentAnswer !== undefined;

  if (showUserForm) {
    return (
      <div className="min-h-screen bg-background pb-4 md:pb-6 px-4">
        {/* Logo */}
        <div className="max-w-2xl mx-auto mb-2 flex justify-center">
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
        <UserInfoForm onSubmit={handleUserInfoSubmit} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-4 md:pb-6 px-4">
      {/* Logo */}
      <div className="max-w-2xl mx-auto mb-2 flex justify-center">
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
