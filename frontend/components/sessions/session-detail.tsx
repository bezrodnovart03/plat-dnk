import AnswerView from './answer-view';
import { useSessionAnswers } from '@/hooks/use-sessions';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface SessionDetailProps {
  session: {
    id: string;
    client_name: string;
    test_title: string;
    test_slug?: string;
    started_at: string;
    status: string;
    answers_count: number;
  };
}

export default function SessionDetail({ session }: SessionDetailProps) {
  const { data: answers = [] } = useSessionAnswers(session.id);

  const handleDownloadReport = async () => {
    try {
      // Создаём документ Word
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: 'Отчёт о прохождении теста',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Клиент: ', bold: true }),
                new TextRun({ text: session.client_name || 'Не указан' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Тест: ', bold: true }),
                new TextRun({ text: session.test_title }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Дата: ', bold: true }),
                new TextRun({ text: new Date(session.started_at).toLocaleString('ru-RU') }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Статус: ', bold: true }),
                new TextRun({ text: session.status === 'completed' ? 'Завершено' : 'В процессе' }),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: 'Ответы клиента',
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 300 },
            }),
            ...(answers.length === 0 
              ? [new Paragraph({ 
                  children: [new TextRun({ text: 'Ответы отсутствуют', italics: true })] 
                })]
              : answers.map((answer: any, idx: number) => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${idx + 1}. ${answer.question_text}`, bold: true }),
                    ],
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Ответ: ', bold: true }),
                      new TextRun({ 
                        text: Array.isArray(answer.answer_value) 
                          ? answer.answer_value.join(', ')
                          : String(answer.answer_value || '—')
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]).flat()
            ),
          ],
        }],
      });

      // Генерируем Blob
      const blob = await Packer.toBlob(doc);
      
      // Скачиваем файл
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${session.client_name || 'client'}_${new Date().toISOString().split('T')[0]}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка генерации отчёта', error);
      alert('Не удалось сгенерировать отчёт');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {session.client_name ? `Прохождение: ${session.client_name}` : 'Сессия в процессе'}
          </h1>
          <p className="text-gray-500">Тест: {session.test_title}</p>
          <p className="text-gray-500">Дата начала: {new Date(session.started_at).toLocaleString('ru-RU')}</p>
          <p className="text-gray-500">
            Статус: 
            <span className={`ml-2 inline-flex px-2 py-0.5 rounded text-sm font-medium ${
              session.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {session.status === 'completed' ? 'Завершена' : 'В процессе'}
            </span>
          </p>
          <p className="text-gray-500">Ответов: {session.answers_count}</p>
          {session.status === 'in_progress' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">Ссылка для клиента:</p>
              <p className="text-blue-600 text-sm break-all mt-1">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/t/${session.test_slug || session.test_title.toLowerCase().replace(/\s+/g, '-')}?session=${session.id}`}
              </p>
              <button
                onClick={() => {
                  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${session.test_slug || session.test_title.toLowerCase().replace(/\s+/g, '-')}?session=${session.id}`;
                  navigator.clipboard.writeText(link);
                  alert('Ссылка скопирована!');
                }}
                className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Копировать ссылку
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleDownloadReport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={session.status !== 'completed'}
        >
          {session.status === 'completed' ? 'Скачать отчёт (DOCX)' : 'Отчёт будет доступен после завершения'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ответы клиента</h2>
        {answers.length === 0 ? (
          <p className="text-gray-500">Пока нет ответов</p>
        ) : (
          answers.map((answer: any, idx: number) => (
            <div key={idx} className="border rounded p-4">
              <p className="font-medium">{answer.question_text}</p>
              <AnswerView answer={answer.answer_value} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}