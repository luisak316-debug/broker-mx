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
        <div className="auth-phone-row">
          <span className="auth-phone-prefix">{country.dialCode}</span>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            id="client-phone-national"
            name="client-phone-national"
            value={phone}
            disabled={disabled}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, maxDigits))}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? undefined : 'phone-hint'}
            className={`auth-field auth-field--phone ${phoneError ? 'auth-field--error' : ''}`}
          />
        </div>
        {!phoneError && (
          <span id="phone-hint" className="mt-1 block text-xs text-emerald-200/45">
            Te enviaremos un código de verificación por SMS a este número.
          </span>
        )}
        {phoneError && <span className="mt-1 block text-xs text-bear">{phoneError}</span>}
      </label>
    </div>
  );
}
