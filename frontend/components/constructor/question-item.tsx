'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'text' | 'scale';
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface QuestionItemProps {
  question: Question;
  onEdit: () => void;
  onDelete: () => void;
}

const typeLabels = {
  single_choice: 'Одиночный выбор',
  text: 'Текстовый ответ',
  scale: 'Шкала',
};

const typeColors = {
  single_choice: 'default',
  text: 'secondary',
  scale: 'outline',
} as const;

export function QuestionItem({ question, onEdit, onDelete }: QuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getScaleLabel = () => {
    if (question.type === 'scale') {
      return `${question.min || 1} - ${question.max || 5}`;
    }
    return '';
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move mt-1 hover:bg-muted rounded p-1 transition-colors"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={typeColors[question.type]}>
                  {typeLabels[question.type]}
                </Badge>
                {question.required && (
                  <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                    Обязательный
                  </Badge>
                )}
                {question.type === 'scale' && (
                  <Badge variant="outline" className="text-xs">
                    {getScaleLabel()}
                  </Badge>
                )}
              </div>
              
              <p className="font-medium break-words">{question.text}</p>
              
              {question.type === 'single_choice' && question.options && question.options.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">Варианты:</span>{' '}
                  {question.options.filter(opt => opt.trim()).join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
