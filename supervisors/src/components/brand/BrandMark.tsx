type BrandMarkSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<BrandMarkSize, string> = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
};

export function BrandMark({
  size = 'md',
  className = '',
}: {
  size?: BrandMarkSize;
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden
      className={`invermax-brand-mark shrink-0 object-cover ${SIZE_CLASS[size]} ${className}`}
    />
  );
}
