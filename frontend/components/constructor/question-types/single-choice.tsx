'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface SingleChoiceEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function SingleChoiceEditor({ options, onChange }: SingleChoiceEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addOption = () => {
    onChange([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    if (draggedIndex !== index) {
      const newOptions = [...options];
      const draggedItem = newOptions[draggedIndex];
      newOptions.splice(draggedIndex, 1);
      newOptions.splice(index, 0, draggedItem);
      onChange(newOptions);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <Label>Варианты ответов *</Label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex gap-2 items-center group"
          >
            <div className="cursor-move text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Вариант ${index + 1}`}
                className="flex-1"
              />
              {options.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Добавить вариант
      </Button>
      <p className="text-xs text-muted-foreground">
        Перетащите вариант, чтобы изменить порядок
      </p>
    </div>
  );
}
