import { useState } from 'react';
import { Flag, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useContentModeration } from '@/hooks/useContentModeration';
import { useLanguage } from '@/components/SettingsDialog';

interface ReportContentDialogProps {
  contentType: 'opinion' | 'question' | 'review' | 'feedback';
  contentId: string;
  trigger?: React.ReactNode;
}

export function ReportContentDialog({ contentType, contentId, trigger }: ReportContentDialogProps) {
  const { t } = useLanguage();
  const { reportContent, loading } = useContentModeration();
  
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState('');

  const reasons = [
    { value: 'inappropriate', label: t('inappropriate'), icon: '🚫' },
    { value: 'spam', label: t('spam'), icon: '📧' },
    { value: 'harassment', label: t('harassment'), icon: '⚠️' },
    { value: 'false_info', label: t('falseInfo'), icon: '❌' },
    { value: 'other', label: t('other'), icon: '📝' }
  ];

  const handleSubmit = async () => {
    if (!reason) return;

    const success = await reportContent({
      content_type: contentType,
      content_id: contentId,
      flag_reason: reason as any,
      flag_details: details || undefined
    });

    if (success) {
      setOpen(false);
      setReason('');
      setDetails('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t('reportContent')}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>{t('selectReason')}</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasons.map((r) => (
                <Label
                  key={r.value}
                  htmlFor={r.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    reason === r.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={r.value} id={r.value} />
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">{t('additionalDetails')}</Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className="flex-1"
            variant="destructive"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              t('submitReport')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
