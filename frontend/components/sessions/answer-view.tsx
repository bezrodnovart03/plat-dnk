export default function AnswerView({ answer }: { answer: any }) {
  // Если ответ — строка (text, scale)
  if (typeof answer === 'string') {
    return <p className="mt-1 text-gray-700">{answer}</p>;
  }
  // Если ответ — массив (multiple choice)
  if (Array.isArray(answer)) {
    return (
      <ul className="mt-1 list-disc list-inside text-gray-700">
        {answer.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }
  // Если ответ — объект (single choice)
  if (typeof answer === 'object' && answer !== null && answer.value) {
    return <p className="mt-1 text-gray-700">{answer.value}</p>;
  }

  return <p className="mt-1 text-gray-700">{JSON.stringify(answer)}</p>;
}