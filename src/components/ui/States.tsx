import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4 bg-white/50 rounded-2xl border border-[#EAE6DF]">
      <div className="p-3 bg-[#FDF2F0] rounded-full text-[#B93825]">
        <AlertCircle size={26} />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif font-bold text-lg text-[#10294F]">Unable to load data</h3>
        <p className="text-xs text-[#5E6E82] max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#10294F] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F8F6F0] transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCcw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4 bg-white/40 rounded-2xl border border-[#EAE6DF]">
      {icon && (
        <div className="p-3.5 bg-white rounded-full text-[#8E9BAE] border border-[#EAE6DF] shadow-xs">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-md">
        <h3 className="font-serif font-bold text-lg text-[#10294F]">{title}</h3>
        {description && <p className="text-xs text-[#5E6E82] leading-relaxed">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white/80 rounded-2xl border border-[#EAE6DF] p-5 animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-[#EAE6DF] rounded w-20" />
            <div className="h-4 bg-[#EAE6DF] rounded w-5" />
          </div>
          <div className="h-40 bg-[#EAE6DF] rounded-xl" />
          <div className="h-5 bg-[#EAE6DF] rounded w-4/5" />
          <div className="h-3 bg-[#EAE6DF] rounded w-1/2" />
          <div className="space-y-1.5 pt-2">
            <div className="h-2.5 bg-[#EAE6DF] rounded" />
            <div className="h-2.5 bg-[#EAE6DF] rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
