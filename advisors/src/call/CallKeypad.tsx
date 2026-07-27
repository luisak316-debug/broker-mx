const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as const;

type Props = {
  onKey: (tone: string) => void;
};

export function CallKeypad({ onKey }: Props) {
  return (
    <div className="call-keypad grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className="call-keypad-key"
          onClick={() => onKey(k)}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
