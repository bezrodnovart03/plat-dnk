'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ScaleEditorProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export function ScaleEditor({ min, max, onChange }: ScaleEditorProps) {
  const handleMinChange = (value: string) => {
    const newMin = parseInt(value);
    if (!isNaN(newMin) && newMin < max) {
      onChange(newMin, max);
    }
  };

  const handleMaxChange = (value: string) => {
    const newMax = parseInt(value);
    if (!isNaN(newMax) && newMax > min) {
      onChange(min, newMax);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Настройки шкалы</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Минимальное значение</Label>
          <Input
            type="number"
            value={min}
            onChange={(e) => handleMinChange(e.target.value)}
            min={1}
            max={max - 1}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Максимальное значение</Label>
          <Input
            type="number"
            value={max}
            onChange={(e) => handleMaxChange(e.target.value)}
            min={min + 1}
            step={1}
          />
        </div>
      </div>
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium mb-1">Пример отображения:</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{min}</span>
          <div className="flex gap-2">
            {Array.from({ length: Math.min(max - min + 1, 5) }, (_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {min + i}
              </div>
            ))}
            {max - min + 1 > 5 && <span>...</span>}
          </div>
          <span className="text-muted-foreground">{max}</span>
        </div>
      </div>
    </div>
  );
}
