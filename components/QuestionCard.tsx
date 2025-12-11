'use client';

import { Question } from '@/types';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface QuestionCardProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedValue: number | string | undefined;
  onSelect: (value: number | string) => void;
}

export default function QuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mt-44 md:mt-52">
      {/* Progress bar */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs md:text-sm">
            Question {currentQuestion} of {totalQuestions}
          </Badge>
          <span className="text-xs md:text-sm font-medium text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question */}
      <h2 className="text-xl md:text-3xl font-semibold mb-6 md:mb-8">
        {question.question}
      </h2>

      {/* Options */}
      <RadioGroup
        value={String(selectedValue)}
        onValueChange={(value) => {
          // Convert back to number if the original value was a number
          const option = question.options.find(opt => String(opt.value) === value);
          if (option) {
            onSelect(option.value);
          }
        }}
        className="space-y-1.5"
      >
        {question.options.map((option) => (
          <Card
            key={String(option.value)}
            className={`cursor-pointer transition-all hover:border-primary py-0 ${
              selectedValue === option.value
                ? 'border-primary bg-accent'
                : ''
            }`}
            onClick={() => onSelect(option.value)}
          >
            <Label
              htmlFor={`option-${String(option.value)}`}
              className="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer min-h-0"
            >
              <RadioGroupItem
                value={String(option.value)}
                id={`option-${String(option.value)}`}
                className="shrink-0"
              />
              <span className="text-sm md:text-base font-medium leading-snug">
                {option.label}
              </span>
            </Label>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}
