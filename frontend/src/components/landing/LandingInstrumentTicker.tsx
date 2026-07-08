type Props = {
  symbols: string[];
  className?: string;
};

export function LandingInstrumentTicker({ symbols, className = '' }: Props) {
  const track = [...symbols, ...symbols];

  return (
    <div className={`cap-ticker ${className}`.trim()} aria-hidden>
      <div className="cap-ticker__track">
        {track.map((symbol, i) => (
          <span key={`${symbol}-${i}`} className="cap-ticker__chip">
            {symbol}
          </span>
        ))}
      </div>
    </div>
  );
}
