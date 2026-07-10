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
        <span className="auth-label mb-1 block text-sm">País de residencia</span>
        <select
          value={countryCode}
          disabled={disabled}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onPhoneChange('');
          }}
          className="auth-field"
        >
          {LATAM_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.currency})
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-emerald-200/45">
          Tu cuenta operará en {country.currency} según tu país.
        </span>
      </label>

      <label className="block">
        <span className="auth-label mb-1 block text-sm">
          Teléfono celular ({phoneLengthHint(country)})
        </span>
        <div className="flex gap-2">
          <span className="auth-field flex shrink-0 items-center px-3 py-2.5 text-sm">
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
            className={`auth-field min-w-0 flex-1 ${phoneError ? 'auth-field--error' : ''}`}
          />
        </div>
        {!phoneError && (
          <span className="mt-1 block text-xs text-emerald-200/45">
            Te enviaremos un código de verificación por SMS a este número.
          </span>
        )}
        {phoneError && <span className="mt-1 block text-xs text-bear">{phoneError}</span>}
      </label>
    </div>
  );
}
