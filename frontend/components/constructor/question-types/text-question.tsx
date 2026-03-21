'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function TextQuestion() {
  return (
    <div className="space-y-3">
      <Label>Настройки текстового вопроса</Label>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          Клиент сможет ввести развернутый ответ в текстовом поле
        </p>
        <Textarea
          placeholder="Пример ответа клиента"
          disabled
          className="bg-background"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Текстовый вопрос не требует дополнительных настроек
      </p>
    </div>
  );
}
