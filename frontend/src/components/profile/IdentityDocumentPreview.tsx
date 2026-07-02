import { resolveUploadUrl } from '../../lib/apiConfig';

type Doc = {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  uploadedAt?: string;
};

function isImage(mimeType: string, fileName: string): boolean {
  return mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(fileName);
}

function isPdf(mimeType: string, fileName: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName);
}

export function IdentityDocumentPreview({
  doc,
  label,
  subtitle,
}: {
  doc: Doc;
  label: string;
  subtitle?: string;
}) {
  const url = resolveUploadUrl(doc.fileUrl);
  const image = isImage(doc.mimeType, doc.fileName);
  const pdf = isPdf(doc.mimeType, doc.fileName);

  return (
    <article className="overflow-hidden rounded-xl border border-ink-600/60 bg-ink-900/50">
      <div className="border-b border-ink-600/40 px-3 py-2">
        <p className="text-sm font-medium text-white">{label}</p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="bg-black/30 p-2">
        {image ? (
          <img
            src={url}
            alt={label}
            className="mx-auto max-h-72 w-full rounded-lg object-contain"
          />
        ) : pdf ? (
          <iframe
            title={label}
            src={url}
            className="h-72 w-full rounded-lg border-0 bg-white"
          />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[12rem] items-center justify-center text-sm text-brand-400 hover:underline"
          >
            Abrir archivo
          </a>
        )}
      </div>
    </article>
  );
}
