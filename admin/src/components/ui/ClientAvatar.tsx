import { resolveUploadUrl } from '../../lib/apiConfig';

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

type Props = {
  displayName: string;
  photoUrl?: string;
  size?: 'sm' | 'md';
};

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
} as const;

export function ClientAvatar({ displayName, photoUrl, size = 'sm' }: Props) {
  const initials = initialsFromName(displayName);
  const resolved = photoUrl ? resolveUploadUrl(photoUrl) : undefined;
  const box = SIZE_CLASS[size];

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={`Foto de ${displayName}`}
        className={`${box} shrink-0 rounded-full object-cover ring-2 ring-amber-400/50`}
      />
    );
  }

  return (
    <span
      className={`${box} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400/90 to-brand-600 font-semibold text-white ring-2 ring-amber-400/30`}
    >
      {initials}
    </span>
  );
}
