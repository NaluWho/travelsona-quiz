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

type TraitRadarChartProps = {
  scores: TraitScores
  compareScores?: TraitScores
}

export function TraitRadarChart({ scores, compareScores }: TraitRadarChartProps) {
  const data = traitDefinitions.map((trait) => ({
    trait: trait.label,
    // Recharts radar radius starts at 0, so shift -6..6 into 0..12.
    youScore: scores[trait.key] + 6,
    friendScore: compareScores ? compareScores[trait.key] + 6 : undefined,
    midpoint: 6,
  }))

  return (
    <div className="h-[360px] w-full rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      {compareScores && (
        <div className="mb-2 flex items-center gap-4 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
            You
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Friend
          </span>
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
          <Radar
            dataKey="youScore"
            fill="#0d9488"
            stroke="#0f766e"
            fillOpacity={0.35}
            dot={{ r: 3, fill: '#115e59' }}
          />
          {compareScores && (
            <Radar
              dataKey="friendScore"
              fill="#fda4af"
              stroke="#e11d48"
              fillOpacity={0.28}
              dot={{ r: 3, fill: '#e11d48' }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
