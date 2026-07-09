import {
  LATAM_COUNTRIES,
  getLatamCountry,
  maxPhoneDigits,
  phoneLengthHint,
} from '../../data/latamCountries';

type Props = {
  countryCode: string;
  phone: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  phoneError?: string;
  disabled?: boolean;
};

export function CountryPhoneFields({
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
  phoneError,
  disabled,
}: Props) {
  const country = getLatamCountry(countryCode);
  const maxDigits = maxPhoneDigits(country);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">País de residencia</span>
        <select
          value={countryCode}
          disabled={disabled}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onPhoneChange('');
          }}
          className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 text-white outline-none transition focus:border-brand-500"
        >
          {LATAM_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.currency})
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-slate-500">
          Tu cuenta operará en {country.currency} según tu país.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">
          Teléfono celular ({phoneLengthHint(country)})
        </span>
        <div className="flex gap-2">
          <span className="flex shrink-0 items-center rounded-lg border border-ink-600 bg-ink-800 px-3 text-sm text-slate-300">
            {country.dialCode}
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            disabled={disabled}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, maxDigits))}
            placeholder={country.phonePlaceholder}
            autoComplete="tel-national"
            className={`min-w-0 flex-1 rounded-lg border bg-ink-900 px-3 py-2 text-white outline-none transition focus:border-brand-500 ${
              phoneError ? 'border-bear' : 'border-ink-600'
            }`}
          />
        </div>
        {!phoneError && (
          <span className="mt-1 block text-xs text-slate-500">
            Te enviaremos un código de verificación por SMS a este número.
          </span>
        )}
        {phoneError && <span className="mt-1 block text-xs text-bear">{phoneError}</span>}
      </label>
    </div>
  );
}
