import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  saved: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

export function BookmarkButton({ saved, onToggle, size = 'md' }: BookmarkButtonProps) {
  const iconSize = size === 'sm' ? 16 : 18;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark this opportunity'}
      aria-pressed={saved}
      className={`
        p-1.5 rounded-full transition-colors cursor-pointer
        ${saved
          ? 'text-[#10294F] bg-black/5 hover:bg-black/10'
          : 'text-[#8E9BAE] hover:text-[#10294F] hover:bg-black/5'
        }
      `}
    >
      <Bookmark
        size={iconSize}
        className={saved ? 'fill-[#10294F] text-[#10294F]' : 'text-current'}
      />
    </button>
  );
}
