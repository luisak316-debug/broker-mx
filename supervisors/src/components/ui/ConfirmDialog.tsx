import type { ReactNode } from 'react';

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  tone?: 'primary' | 'danger' | 'ok';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const confirmCls = tone === 'danger' ? 'btn-danger' : tone === 'ok' ? 'btn-ok' : 'btn-primary';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-800 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warn/20 text-warn">
            !
          </span>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <div className="mb-5 text-sm text-slate-300">{children}</div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={confirmCls} onClick={onConfirm} disabled={busy}>
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
