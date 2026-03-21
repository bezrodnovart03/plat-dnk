'use client';

import { useState } from 'react';
import { useReorderQuestions, useDeleteQuestion } from '@/hooks/use-tests';
import { QuestionItem } from './question-item';
import { QuestionBuilder } from './question-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'text' | 'scale';
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  order: number;
}

interface QuestionListProps {
  testId: string;
  questions: Question[];
}

export function QuestionList({ testId, questions }: QuestionListProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const reorderQuestions = useReorderQuestions(testId);
  const deleteQuestion = useDeleteQuestion(testId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      
      const newOrder = arrayMove(questions, oldIndex, newIndex);
      const questionIds = newOrder.map((q) => q.id);
      
      try {
        await reorderQuestions.mutateAsync(questionIds);
      } catch (error) {
        console.error('Failed to reorder questions:', error);
      }
    }
  };

  const handleDelete = async (questionId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        await deleteQuestion.mutateAsync(questionId);
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingQuestion(null);
  };

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Вопросы теста</CardTitle>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить вопрос
          </Button>
        </CardHeader>
        <CardContent>
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>У теста пока нет вопросов</p>
              <p className="text-sm mt-2">Нажмите "Добавить вопрос", чтобы начать</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={sortedQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedQuestions.map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      onEdit={() => handleEdit(question)}
                      onDelete={() => handleDelete(question.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {showBuilder && (
        <QuestionBuilder
          testId={testId}
          editingQuestion={editingQuestion}
          onClose={handleCloseBuilder}
        />
      )}
    </>
  );
}
