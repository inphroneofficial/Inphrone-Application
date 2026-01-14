import { useState } from 'react';
import { Share2, Link2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useShareInsights } from '@/hooks/useShareInsights';
import { useLanguage } from '@/components/SettingsDialog';

interface ShareInsightButtonProps {
  insightType: string;
  insightData: any;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

export function ShareInsightButton({ 
  insightType, 
  insightData, 
  variant = 'ghost',
  size = 'sm'
}: ShareInsightButtonProps) {
  const { t } = useLanguage();
  const { createShareableLink, loading } = useShareInsights();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const link = await createShareableLink(insightType, insightData);
    if (link) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleShare}
          disabled={loading}
          className="gap-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {size !== 'icon' && (
            <span>{copied ? 'Copied!' : t('shareInsight')}</span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('createShareableLink')}
      </TooltipContent>
    </Tooltip>
  );
}
