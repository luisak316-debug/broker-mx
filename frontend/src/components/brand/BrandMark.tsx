type BrandMarkSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<BrandMarkSize, string> = {
  sm: 'invermax-brand-mark--sm h-9 w-9 rounded-lg text-base',
  md: 'invermax-brand-mark--md h-10 w-10 rounded-lg text-lg',
  lg: 'invermax-brand-mark--lg h-12 w-12 rounded-xl text-xl',
};

/** Icono «I» INVERMAX LATAM — gris arriba, carbón abajo, halo dorado. */
export function BrandMark({
  size = 'md',
  className = '',
}: {
  size?: BrandMarkSize;
  className?: string;
}) {
  return (
    <span
      className={`invermax-brand-mark grid shrink-0 place-items-center font-bold text-white ${SIZE_CLASS[size]} ${className}`}
      aria-hidden
    >
      I
    </span>
  );
}
