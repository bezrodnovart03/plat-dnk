'use client';

import { useState, useEffect } from 'react';
import { useAddQuestion, useUpdateQuestion } from '@/hooks/use-tests';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SingleChoiceEditor } from './question-types/single-choice';
import { ScaleEditor } from './question-types/scale-editor';
import { TextQuestion } from './question-types/text-question';
import { toast } from 'sonner';

interface Question {
  id?: string;
  text: string;
  type: 'single_choice' | 'text' | 'scale';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface QuestionBuilderProps {
  testId: string;
  editingQuestion?: Question | null;
  onClose: () => void;
}

type QuestionType = 'single_choice' | 'text' | 'scale';

export function QuestionBuilder({ testId, editingQuestion, onClose }: QuestionBuilderProps) {
  const [question, setQuestion] = useState<Question>({
    text: '',
    type: 'single_choice',
    required: false,
    options: [''],
    min: 1,
    max: 5,
  });

  const addQuestion = useAddQuestion(testId);
  const updateQuestion = useUpdateQuestion(testId);

  useEffect(() => {
    if (editingQuestion) {
      setQuestion({
        ...editingQuestion,
        options: editingQuestion.options || [''],
        min: editingQuestion.min || 1,
        max: editingQuestion.max || 5,
      });
    }
  }, [editingQuestion]);

  const handleSubmit = async () => {
    if (!question.text.trim()) {
      toast.error('Введите текст вопроса');
      return;
    }

    if (question.type === 'single_choice') {
      const validOptions = question.options?.filter(opt => opt.trim());
      if (!validOptions || validOptions.length === 0) {
        toast.error('Добавьте хотя бы один вариант ответа');
        return;
      }
    }

    try {
      // Формируем данные вопроса с metadata обёрткой
      const questionData: any = {
        text: question.text.trim(),
        type: question.type,
        required: question.required,
        metadata: {},
      };

      // Добавляем options в metadata для single_choice
      if (question.type === 'single_choice') {
        questionData.metadata.options = question.options?.filter(opt => opt.trim()) || [];
      }

      // Добавляем scale_min/scale_max в metadata для scale
      if (question.type === 'scale') {
        questionData.metadata.scale_min = question.min || 1;
        questionData.metadata.scale_max = question.max || 5;
      }

      if (editingQuestion?.id) {
        await updateQuestion.mutateAsync({
          questionId: editingQuestion.id,
          data: questionData,
        });
        toast.success('Вопрос обновлён');
      } else {
        await addQuestion.mutateAsync(questionData);
        toast.success('Вопрос добавлен');
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast.error(error?.response?.data?.message || 'Ошибка при сохранении вопроса');
    }
  };

  const handleTypeChange = (type: QuestionType) => {
    setQuestion({
      ...question,
      type,
      options: type === 'single_choice' ? [''] : undefined,
      min: type === 'scale' ? 1 : undefined,
      max: type === 'scale' ? 5 : undefined,
    });
  };

  const renderTypeEditor = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <SingleChoiceEditor
            options={question.options || ['']}
            onChange={(options) => setQuestion({ ...question, options })}
          />
        );
      case 'scale':
        return (
          <ScaleEditor
            min={question.min || 1}
            max={question.max || 5}
            onChange={(min, max) => setQuestion({ ...question, min, max })}
          />
        );
      case 'text':
        return <TextQuestion />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Тип вопроса */}
          <div className="space-y-2">
            <Label>Тип вопроса *</Label>
            <Select value={question.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_choice">Одиночный выбор</SelectItem>
                <SelectItem value="text">Текстовый ответ</SelectItem>
                <SelectItem value="scale">Шкала</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Текст вопроса */}
          <div className="space-y-2">
            <Label>Текст вопроса *</Label>
            <Textarea
              value={question.text}
              onChange={(e) => setQuestion({ ...question, text: e.target.value })}
              placeholder="Введите текст вопроса"
              rows={3}
            />
          </div>

          {/* Обязательность */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={question.required}
              onCheckedChange={(checked) => 
                setQuestion({ ...question, required: checked as boolean })
              }
            />
            <Label htmlFor="required" className="cursor-pointer">
              Обязательный вопрос
            </Label>
          </div>

          {/* Специфичный редактор */}
          {renderTypeEditor()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={addQuestion.isPending || updateQuestion.isPending}
          >
            {addQuestion.isPending || updateQuestion.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Сохранение...
              </div>
            ) : (
              editingQuestion ? 'Сохранить' : 'Добавить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
