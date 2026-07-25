import { cn } from "@/lib/cn";

export type BarSegment = { name: string; value: number; className: string };
export type BarGroup = { label: string; bars: BarSegment[] };

/**
 * Grouped bar chart. Bars are scaled against the tallest value across all groups so
 * month-over-month comparisons stay honest.
 */
export function BarChart({
  data,
  height = "h-40",
  formatValue,
}: {
  data: BarGroup[];
  height?: string;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...data.flatMap((group) => group.bars.map((bar) => bar.value)));

  return (
    <div>
      <div className={cn("flex items-end gap-2", height)}>
        {data.map((group) => (
          <div key={group.label} className="flex h-full flex-1 items-end gap-[3px]">
            {group.bars.map((bar) => (
              <div
                key={bar.name}
                title={`${group.label} · ${bar.name}: ${formatValue ? formatValue(bar.value) : bar.value}`}
                className={cn("min-h-[2px] flex-1 rounded-t transition-all", bar.className)}
                style={{ height: `${Math.max((bar.value / max) * 100, 1)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs text-text-muted">
        {data.map((group) => (
          <span key={group.label} className="flex-1 text-center">
            {group.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({ items }: { items: Array<{ name: string; className: string }> }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded", item.className)} />
          <span className="text-xs text-text-muted">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

export type DonutSegment = { label: string; value: number; className: string };

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 128,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  const arcs = segments.reduce<Array<DonutSegment & { dash: number; offset: number }>>((acc, segment) => {
    const share = segment.value / total;
    const consumed = acc.reduce((sum, arc) => sum + arc.value / total, 0);
    acc.push({ ...segment, dash: circumference * share, offset: -circumference * consumed });
    return acc;
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${centerLabel}: ${centerValue}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="16"
          fill="none"
          className="text-border/20"
        />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            className={arc.className}
            strokeDasharray={`${arc.dash} ${circumference}`}
            strokeDashoffset={arc.offset}
          >
            <title>{`${arc.label}: ${arc.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold font-display text-text-primary">{centerValue}</p>
          <p className="text-xs text-text-muted">{centerLabel}</p>
        </div>
      </div>
    </div>
  );
}

export function LineChart({
  points,
  suffix = "",
  className = "text-accent",
}: {
  points: Array<{ label: string; value: number }>;
  suffix?: string;
  className?: string;
}) {
  if (points.length === 0) return null;

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padded = { min: min - span * 0.25, max: max + span * 0.25 };
  const range = padded.max - padded.min || 1;

  const width = 540;
  const height = 120;
  const step = points.length > 1 ? (width - 20) / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    ...point,
    x: 10 + index * step,
    y: height - ((point.value - padded.min) / range) * height,
  }));

  const path = coords.map((coord) => `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`).join(" ");

  return (
    <div>
      <div className="relative h-32">
        <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" className={className} points={path} />
          {coords.map((coord) => (
            <circle key={coord.label} cx={coord.x} cy={coord.y} r="4" fill="currentColor" className={className}>
              <title>{`${coord.label}: ${coord.value.toFixed(1)}${suffix}`}</title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="mt-1 flex justify-between text-xs text-text-muted">
        {points.map((point) => (
          <span key={point.label} className="flex-1 text-center">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
