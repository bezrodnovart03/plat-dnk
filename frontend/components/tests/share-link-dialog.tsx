'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

export function ShareLinkDialog({ open, onOpenChange, slug }: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ссылка для клиента</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Отправьте эту ссылку клиенту для прохождения теста:
          </p>
          
          {!showQR ? (
            <div className="flex gap-2">
              <Input value={link} readOnly className="flex-1 font-mono text-sm" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={link} size={200} />
              </div>
              <p className="text-sm text-muted-foreground">
                Отсканируйте QR-код камерой телефона
              </p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="mt-4 w-full"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {showQR ? 'Показать ссылку' : 'Показать QR-код'}
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
