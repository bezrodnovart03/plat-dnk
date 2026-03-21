import AnswerView from './answer-view';
import { reportsAPI } from '@/lib/api';

interface SessionDetailProps {
  session: {
    id: string;
    clientName: string;
    createdAt: string;
    answers: Array<{
      questionId: string;
      questionText: string;
      answer: any;
    }>;
  };
}

export default function SessionDetail({ session }: SessionDetailProps) {
  const handleDownloadReport = async () => {
    try {
      const blob = await reportsAPI.getReport(session.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${session.clientName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания отчёта', error);
      alert('Не удалось скачать отчёт');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Прохождение: {session.clientName}</h1>
          <p className="text-gray-500">Дата: {new Date(session.createdAt).toLocaleString()}</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Скачать отчёт (DOCX)
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ответы клиента</h2>
        {session.answers.map((answer, idx) => (
          <div key={idx} className="border rounded p-4">
            <p className="font-medium">{answer.questionText}</p>
            <AnswerView answer={answer.answer} />
          </div>
        ))}
      </div>
    </div>
  );
}