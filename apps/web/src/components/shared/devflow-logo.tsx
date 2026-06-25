import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DevFlowLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: 'h-7 w-7', icon: 'h-3.5 w-3.5', text: 'text-base' },
  md: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-lg' },
  lg: { container: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-2xl' },
};

export function DevFlowLogo({ size = 'md', showText = true, className }: DevFlowLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex items-center justify-center rounded-lg bg-primary', s.container)}>
        <Zap className={cn('text-primary-foreground', s.icon)} />
      </div>
      {showText && <span className={cn('font-bold tracking-tight', s.text)}>DevFlow</span>}
    </div>
  );
}
