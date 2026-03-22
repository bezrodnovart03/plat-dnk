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

// Внутренний интерфейс для редактирования
interface QuestionFormData {
  id?: string;
  text: string;
  type: 'single_choice' | 'text' | 'scale';
  required: boolean;
  weight: number; // Вес вопроса (0-100)
  options: string[];
  min: number;
  max: number;
}

// Интерфейс для внешних данных (с metadata)
interface QuestionForm {
  id?: string;
  text: string;
  type: 'single_choice' | 'text' | 'scale';
  required?: boolean;
  weight?: number;
  metadata?: {
    options?: string[];
    scale_min?: number;
    scale_max?: number;
  };
  order_index?: number;
}

interface QuestionBuilderProps {
  testId: string;
  editingQuestion?: QuestionForm | null;
  onClose: () => void;
}

type QuestionType = 'single_choice' | 'text' | 'scale';

export function QuestionBuilder({ testId, editingQuestion, onClose }: QuestionBuilderProps) {
  const [question, setQuestion] = useState<QuestionFormData>({
    text: '',
    type: 'single_choice',
    required: false,
    weight: 0, // Будет рассчитано автоматически
    options: [''],
    min: 1,
    max: 5,
  });

  const addQuestion = useAddQuestion(testId);
  const updateQuestion = useUpdateQuestion(testId);

  useEffect(() => {
    if (editingQuestion) {
      setQuestion({
        id: editingQuestion.id,
        text: editingQuestion.text,
        type: editingQuestion.type,
        required: editingQuestion.required || false,
        weight: editingQuestion.weight || 0,
        options: editingQuestion.metadata?.options || [''],
        min: editingQuestion.metadata?.scale_min || 1,
        max: editingQuestion.metadata?.scale_max || 5,
      });
    } else {
      // Сброс при создании нового вопроса
      setQuestion({
        text: '',
        type: 'single_choice',
        required: false,
        weight: 0,
        options: [''],
        min: 1,
        max: 5,
      });
    }
  }, [editingQuestion]);

  const handleSubmit = async () => {
    if (!question.text.trim()) {
      toast.error('Введите текст вопроса');
      return;
    }

    if (question.type === 'single_choice') {
      const validOptions = question.options.filter((opt: string) => typeof opt === 'string' && opt.trim());
      if (validOptions.length === 0) {
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
        weight: question.weight,
        metadata: {},
      };

      // Добавляем options в metadata для single_choice
      if (question.type === 'single_choice') {
        questionData.metadata.options = question.options.filter((opt: string) => typeof opt === 'string' && opt.trim());
      }

      // Добавляем scale_min/scale_max в metadata для scale
      if (question.type === 'scale') {
        questionData.metadata.scale_min = question.min;
        questionData.metadata.scale_max = question.max;
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

  const handleTypeChange = (type: string) => {
    const qType = type as QuestionType;
    setQuestion({
      ...question,
      type: qType,
      options: qType === 'single_choice' ? [''] : question.options,
      min: qType === 'scale' ? 1 : question.min,
      max: qType === 'scale' ? 5 : question.max,
    });
  };

  const renderTypeEditor = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <SingleChoiceEditor
            options={question.options}
            onChange={(options) => setQuestion({ ...question, options })}
          />
        );
      case 'scale':
        return (
          <ScaleEditor
            min={question.min}
            max={question.max}
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
                <SelectValue 
                  placeholder="Выберите тип вопроса"
                  options={[
                    { value: 'single_choice', label: 'Одиночный выбор' },
                    { value: 'text', label: 'Текстовый ответ' },
                    { value: 'scale', label: 'Шкала' },
                  ]}
                />
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

          {/* Вес вопроса */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Вес вопроса (%)</Label>
              <span className="text-sm text-muted-foreground">{question.weight.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={question.weight}
              onChange={(e) => setQuestion({ ...question, weight: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-muted-foreground">
              Влияет на расчёт итогового результата. При 0% — авто-распределение.
            </p>
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
