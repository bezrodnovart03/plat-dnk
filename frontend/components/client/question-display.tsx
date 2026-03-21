'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: any) => void;
  disabled?: boolean;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled
}: QuestionDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [scaleValue, setScaleValue] = useState<number | null>(null);

  // ← НОВОЕ: Сброс state при смене вопроса
  useEffect(() => {
    setSelectedOption(null);
    setTextAnswer('');
    setScaleValue(null);
  }, [question.id, questionNumber]); // Срабатывает когда меняется вопрос

  // ← НОВОЕ: Логирование данных вопроса
  useEffect(() => {
    console.log('Current question:', question);
    console.log('Question type:', question.type);
    console.log('Question metadata:', question.metadata);
  }, [question]);

  const handleSubmit = () => {
    let answer: any;
    switch (question.type) {
      case 'single-choice':
      case 'single_choice':  // ← ДОБАВИЛ для support обоих форматов
        answer = selectedOption;
        break;
      case 'text':
        answer = textAnswer;
        break;
      case 'scale':
      case 'scale-rate':
      case 'scale_rate':  // ← ДОБАВИЛ для support разных форматов
        answer = scaleValue;
        break;
      default:
        answer = selectedOption;
    }
    if (answer) onAnswer(answer);
  };

  const canSubmit = () => {
    switch (question.type) {
      case 'single-choice':
      case 'single_choice':  // ← ДОБАВИЛ для support обоих форматов
        return selectedOption !== null;
      case 'text':
        return textAnswer.trim().length > 0;
      case 'scale':
      case 'scale-rate':
      case 'scale_rate':  // ← ДОБАВИЛ для support разных форматов
        return scaleValue !== null;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
          Вопрос {questionNumber} из {totalQuestions}
        </span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">{question.text}</h2>

      {(question.type === 'single-choice' || question.type === 'single_choice') && question.metadata?.options && (
        <div className="space-y-3">
          {question.metadata.options.map((option, idx) => (
            <button
              key={option.id || idx}
              onClick={() => setSelectedOption(option.id || String(idx))}
              disabled={disabled}
              className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                selectedOption === option.id || selectedOption === String(idx)
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              } disabled:opacity-50`}
            >
              <span className="font-medium text-gray-900">{option.text}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Ваш ответ..."
          rows={4}
          disabled={disabled}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-0 transition-all disabled:opacity-50"
        />
      )}

      {(question.type === 'scale' || question.type === 'scale-rate' || question.type === 'scale_rate') && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{question.metadata?.scale_labels?.['1'] || question.metadata?.minLabel || 'Минимум'}</span>
            <span>{question.metadata?.scale_labels?.[String(question.metadata?.scale_max || 10)] || question.metadata?.maxLabel || 'Максимум'}</span>
          </div>
          <input
            type="range"
            min={question.metadata?.scale_min || 1}
            max={question.metadata?.scale_max || 10}
            value={scaleValue || question.metadata?.scale_min || 1}
            onChange={(e) => setScaleValue(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="text-center text-lg font-semibold text-indigo-600">
            {scaleValue || question.metadata?.scale_min || 1}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit() || disabled}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
      >
        {questionNumber === totalQuestions ? 'Завершить тест' : 'Далее'}
      </button>
    </div>
  );
}