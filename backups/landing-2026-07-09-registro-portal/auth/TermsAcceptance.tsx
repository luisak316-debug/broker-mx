import { TERMS_ACCEPTANCE_LABEL, TERMS_SECTIONS } from '../../data/termsContent';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
};

export function TermsAcceptance({ checked, onChange, error, disabled }: Props) {
  return (
    <div className="auth-terms landing-glass-emerald--subtle rounded-xl p-4">
      <p className="auth-terms__title portal-title text-sm font-semibold">Términos y Condiciones</p>
      <div className="auth-terms__body mt-3 max-h-44 space-y-3 overflow-y-auto pr-1 text-xs leading-relaxed text-emerald-50/80">
        {TERMS_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="font-medium text-white">{section.title}</p>
            <p className="mt-1 text-emerald-100/70">{section.body}</p>
          </div>
        ))}
      </div>
      <label className="auth-terms__check mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="auth-terms__checkbox mt-0.5 h-4 w-4 shrink-0 accent-emerald-400"
        />
        <span className="text-xs leading-relaxed text-emerald-50/90">{TERMS_ACCEPTANCE_LABEL}</span>
      </label>
      {error && <p className="mt-2 text-xs text-bear">{error}</p>}
    </div>
  );
}
