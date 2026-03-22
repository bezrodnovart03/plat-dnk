'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTest, useQuestions, useUpdateTest } from '@/hooks/use-tests';
import { QuestionList } from '@/components/constructor/question-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ShareLinkDialog } from '@/components/tests/share-link-dialog';

export default function ConstructorPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;
  
  const { data: test, isLoading: testLoading, refetch: refetchTest } = useTest(testId);
  const { data: questions = [], isLoading: questionsLoading } = useQuestions(testId);
  const updateTest = useUpdateTest();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (test && !isInitialized) {
      setTitle(test.title);
      setDescription(test.description || '');
      setIsInitialized(true);
    }
  }, [test, isInitialized]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Название теста обязательно');
      return;
    }

    try {
      await updateTest.mutateAsync({
        id: testId,
        data: { title, description },
      });
      toast.success('Тест сохранён');
      refetchTest();
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  if (testLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Тест не найден</p>
            <div className="flex justify-center mt-4">
              <Link href="/tests">
                <Button>Вернуться к списку</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/tests">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к тестам
            </Button>
          </Link>
          
          {test.slug && (
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Поделиться
            </Button>
          )}
        </div>
        
        {/* Test Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Редактирование теста</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Название теста *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название теста"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Описание
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание теста"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={updateTest.isPending}>
                {updateTest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Сохранить изменения
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Section */}
      <QuestionList testId={testId} questions={questions} />

      {/* Share Dialog */}
      {test.slug && (
        <ShareLinkDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          slug={test.slug}
        />
      )}
    </div>
  );
}
