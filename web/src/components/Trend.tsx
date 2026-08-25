type Props = {
  direction: "up" | "down" | "flat";
  label?: string;
};

const config = {
  up: { glyph: "↑", cls: "bg-good-bg text-good", text: "Up" },
  down: { glyph: "↓", cls: "bg-low-bg text-low", text: "Down" },
  flat: { glyph: "→", cls: "bg-demo-bg text-demo", text: "Flat" },
} as const;

export function Trend({ direction, label }: Props) {
  const { glyph, cls, text } = config[direction];
  return (
    <span className={`badge ${cls}`} title={`Trend: ${text}`}>
      <span aria-hidden="true">{glyph}</span>
      {label ?? text}
    </span>
  );
}
