import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { traitDefinitions } from '../data/traits'
import type { TraitScores } from '../types/quiz'

type RadarOverlay = {
  dataKey: string
  label: string
  scores: TraitScores
  fill: string
  stroke: string
  dot: string
}

type TraitRadarChartProps = {
  scores: TraitScores
  compareScores?: TraitScores
  compareLabel?: string
  overlays?: RadarOverlay[]
}

export function TraitRadarChart({ scores, compareScores, compareLabel = 'Friend', overlays }: TraitRadarChartProps) {
  const overlaySeries = overlays ?? [
    {
      dataKey: 'youScore',
      label: 'You',
      scores,
      fill: '#0d9488',
      stroke: '#0f766e',
      dot: '#115e59',
    },
    ...(compareScores
      ? [{ dataKey: 'friendScore', label: compareLabel, scores: compareScores, fill: '#fda4af', stroke: '#e11d48', dot: '#e11d48' }]
      : []),
  ]

  const data = traitDefinitions.map((trait) => ({
    trait: trait.label,
    // Recharts radar radius starts at 0, so shift -6..6 into 0..12.
    ...Object.fromEntries(
      overlaySeries.map((overlay) => [
        overlay.dataKey,
        overlay.scores[trait.key] + 6,
      ]),
    ),
    midpoint: 6,
  }))

  return (
    <div className="h-[360px] w-full rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      {overlaySeries.length > 1 && (
        <div className="mb-2 flex items-center gap-4 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
          {overlaySeries.map((overlay) => (
            <span key={overlay.dataKey} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: overlay.stroke }} />
              {overlay.label}
            </span>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#ddd6cb" />
          <PolarAngleAxis dataKey="trait" tick={{ fill: '#3f3f46', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 12]} tick={false} axisLine={false} />
          <Radar
            dataKey="midpoint"
            stroke="#f59e0b"
            fill="none"
            strokeDasharray="5 4"
            isAnimationActive={false}
            dot={false}
          />
          {overlaySeries.map((overlay, index) => (
            <Radar
              key={overlay.dataKey}
              dataKey={overlay.dataKey}
              fill={overlay.fill}
              stroke={overlay.stroke}
              fillOpacity={index === 0 ? 0.35 : 0.18}
              dot={{ r: 3, fill: overlay.dot }}
              isAnimationActive={false}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
