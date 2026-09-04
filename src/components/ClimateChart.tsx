import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { Climate, SiteId } from "@/lib/sites";
import { climate, trendPerDecade } from "@/lib/sites";

const palette = {
  annual: "#d9a441",
  summer: "#7fb8d4",
  grid: "rgba(217,164,65,0.14)",
  axis: "#8a8576",
};

export default function ClimateChart({ siteId }: { siteId: SiteId }) {
  const c: Climate = climate[siteId];
  const data = c.series.map((y) => ({
    year: y.year,
    annual: Number(y.annualMean.toFixed(2)),
    summer: y.summerMean == null ? null : Number(y.summerMean.toFixed(2)),
  }));
  const trend = trendPerDecade(
    c.series.map((y) => ({ year: y.year, value: y.annualMean })),
  );

  const midYear = Math.round(
    (c.series[0]!.year + c.series[c.series.length - 1]!.year) / 2,
  );
  const midTemp =
    c.series.find((y) => y.year === midYear)?.annualMean ??
    c.series[Math.floor(c.series.length / 2)]!.annualMean;
  const startY = c.series[0]!.annualMean;
  const slope = trend / 10; // per year
  const lineY = (year: number) =>
    Number((midTemp + slope * (year - midYear)).toFixed(2));

  const trendData = [
    { year: c.series[0]!.year, trend: lineY(c.series[0]!.year) },
    { year: c.series[c.series.length - 1]!.year, trend: lineY(c.series[c.series.length - 1]!.year) },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>
          <span className="field-label">Annual mean trend</span>
          <div className="data-value text-lg">
            {trend > 0 ? "+" : ""}
            {trend.toFixed(2)} °C / decade
          </div>
        </div>
        <div>
          <span className="field-label">Window</span>
          <div className="data-value text-sm">
            {c.series[0]!.year}–{c.series[c.series.length - 1]!.year}
          </div>
        </div>
        <div>
          <span className="field-label">Grid elevation</span>
          <div className="data-value text-sm">{c.gridElevation.toFixed(0)} m</div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 18, left: -8 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fill: palette.axis, fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: palette.axis }}
              interval={9}
            />
            <YAxis
              tick={{ fill: palette.axis, fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: palette.axis }}
              width={40}
              unit="°"
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.223 0.016 258)",
                border: "1px solid oklch(0.45 0.02 258)",
                borderRadius: 4,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#e8e2d4",
              }}
              labelStyle={{ color: "#d9a441" }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
              iconType="plainline"
            />
            <Line
              type="monotone"
              dataKey="annual"
              name="Annual mean"
              stroke={palette.annual}
              dot={false}
              strokeWidth={1.6}
            />
            <Line
              type="monotone"
              dataKey="summer"
              name="Summer (JJA) mean"
              stroke={palette.summer}
              dot={false}
              strokeWidth={1.6}
              connectNulls
            />
            <Line
              data={trendData}
              dataKey="trend"
              name="Linear trend"
              stroke="#e8e2d4"
              strokeDasharray="4 3"
              dot={false}
              strokeWidth={1}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Near-surface air temperature at the {c.gridElevation.toFixed(0)} m grid cell
        ({c.gridLat.toFixed(2)}°N, {c.gridLon.toFixed(2)}°E). The dashed line is the
        ordinary-least-squares trend over the full window. Use it as context for
        melt conditions — not a forecast.
      </p>
    </div>
  );
}
