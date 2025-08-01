import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';

export interface LoadingIndicatorProps {
  progress?: number;
  stage?: 'loading' | 'processing' | 'encoding' | 'complete' | 'error';
  message?: string;
  timeRemaining?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

const stageConfig = {
  loading: {
    icon: Loader2,
    label: 'Loading',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  processing: {
    icon: Zap,
    label: 'Processing',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  encoding: {
    icon: Clock,
    label: 'Encoding',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  complete: {
    icon: CheckCircle,
    label: 'Complete',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  error: {
    icon: XCircle,
    label: 'Error',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

const sizeConfig = {
  sm: {
    icon: 'h-4 w-4',
    text: 'text-sm',
    spacing: 'space-y-2',
    padding: 'p-3'
  },
  md: {
    icon: 'h-5 w-5',
    text: 'text-base',
    spacing: 'space-y-3',
    padding: 'p-4'
  },
  lg: {
    icon: 'h-6 w-6',
    text: 'text-lg',
    spacing: 'space-y-4',
    padding: 'p-6'
  }
};

export function LoadingIndicator({
  progress = 0,
  stage = 'loading',
  message,
  timeRemaining,
  showProgress = true,
  size = 'md',
  variant = 'default',
  className
}: LoadingIndicatorProps) {
  const config = stageConfig[stage];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  
  const progressPercentage = Math.max(0, Math.min(100, progress * 100));
  
  const formatTimeRemaining = (time: number): string => {
    if (time < 1000) return 'Less than 1 second';
    const seconds = Math.ceil(time / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const content = (
    <div className={cn(sizeStyles.spacing, 'flex flex-col items-center text-center')}>
      {/* Icon and Stage */}
      <div className="flex items-center space-x-2">
        <Icon 
          className={cn(
            sizeStyles.icon,
            config.color,
            stage === 'loading' || stage === 'processing' ? 'animate-spin' : ''
          )} 
        />
        <Badge variant="secondary" className={cn(config.bgColor, config.borderColor, config.color)}>
          {config.label}
        </Badge>
      </div>

      {/* Message */}
      {message && (
        <p className={cn(sizeStyles.text, 'text-muted-foreground font-medium')}>
          {message}
        </p>
      )}

      {/* Progress Bar */}
      {showProgress && stage !== 'complete' && stage !== 'error' && (
        <div className="w-full space-y-2">
          <Progress 
            value={progressPercentage} 
            className="w-full"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{Math.round(progressPercentage)}%</span>
            {timeRemaining && timeRemaining > 0 && (
              <span>{formatTimeRemaining(timeRemaining)} remaining</span>
            )}
          </div>
        </div>
      )}

      {/* Success/Error State */}
      {stage === 'complete' && (
        <p className={cn(sizeStyles.text, 'text-green-600 font-medium')}>
          Processing completed successfully!
        </p>
      )}

      {stage === 'error' && (
        <p className={cn(sizeStyles.text, 'text-red-600 font-medium')}>
          An error occurred during processing
        </p>
      )}
    </div>
  );

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Icon 
          className={cn(
            'h-4 w-4',
            config.color,
            stage === 'loading' || stage === 'processing' ? 'animate-spin' : ''
          )} 
        />
        <span className="text-sm text-muted-foreground">
          {message || config.label}
        </span>
        {showProgress && stage !== 'complete' && stage !== 'error' && (
          <span className="text-xs text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn(config.borderColor, className)}>
        <CardContent className={sizeStyles.padding}>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(sizeStyles.padding, className)}>
      {content}
    </div>
  );
}

// Specialized loading indicators for common use cases

export function GifSearchLoading({ className }: { className?: string }) {
  return (
    <LoadingIndicator
      stage="loading"
      message="Searching for GIFs..."
      showProgress={false}
      variant="minimal"
      className={className}
    />
  );
}

export function GifProcessingLoading({ 
  progress, 
  stage, 
  timeRemaining,
  className 
}: { 
  progress?: number;
  stage?: LoadingIndicatorProps['stage'];
  timeRemaining?: number;
  className?: string;
}) {
  const getMessage = (currentStage: string) => {
    switch (currentStage) {
      case 'loading': return 'Initializing FFmpeg...';
      case 'processing': return 'Adding text overlays...';
      case 'encoding': return 'Encoding final GIF...';
      case 'complete': return 'GIF processing complete!';
      case 'error': return 'Failed to process GIF';
      default: return 'Processing GIF...';
    }
  };

  return (
    <LoadingIndicator
      progress={progress}
      stage={stage}
      message={getMessage(stage || 'loading')}
      timeRemaining={timeRemaining}
      showProgress={true}
      variant="card"
      size="md"
      className={className}
    />
  );
}

export function FFmpegInitializationLoading({ className }: { className?: string }) {
  return (
    <LoadingIndicator
      stage="loading"
      message="Loading FFmpeg WebAssembly modules..."
      showProgress={false}
      variant="card"
      size="md"
      className={className}
    />
  );
}