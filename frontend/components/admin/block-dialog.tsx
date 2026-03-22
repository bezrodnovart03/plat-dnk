'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  psychologist: any;
  onConfirm: () => void;
  isLoading: boolean;
}

export function BlockDialog({
  open,
  onOpenChange,
  psychologist,
  onConfirm,
  isLoading,
}: BlockDialogProps) {
  if (!psychologist) return null;

  const isBlocking = psychologist.is_active;

  const title = isBlocking ? 'Блокировка психолога' : 'Разблокировка психолога';
  const message = isBlocking
    ? `Вы действительно хотите заблокировать психолога ${psychologist.full_name}?`
    : `Вы действительно хотите разблокировать психолога ${psychologist.full_name}?`;
  const description = isBlocking
    ? 'Заблокированный психолог не сможет войти в систему и создавать тесты.'
    : 'После разблокировки психолог сможет снова пользоваться платформой.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{message}</p>
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            variant={isBlocking ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? 'Сохранение...'
              : isBlocking
                ? 'Заблокировать'
                : 'Разблокировать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
