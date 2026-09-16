import { buildAxisYears, buildMilestones, buildScale, buildTracks } from '../lib/timeline'
import type { Award, Experience, Project } from '../types/database'

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px] text-accent"
    >
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M5 6H3a2 2 0 0 0 2 4M19 6h2a2 2 0 0 1-2 4" />
    </svg>
  )
}

export default function HistoryTimeline({
  experiences,
  awards,
  projects,
}: {
  experiences: Experience[]
  awards: Award[]
  projects: Project[]
}) {
  if (experiences.length === 0) return null

  const now = new Date()
  const dates = experiences.flatMap((e) => [
    new Date(e.start_date ?? now),
    e.end_date ? new Date(e.end_date) : now,
  ])
  const scale = buildScale(dates, now)
  const tracks = buildTracks(experiences, scale, now)
  const milestones = buildMilestones(awards, projects, scale)
  const axisYears = buildAxisYears(scale)
  const nowLeft = scale.pct(now)

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0">
          {milestones.map((m, i) => (
            <div
              key={i}
              className="bg-border-soft absolute top-0 bottom-0 w-px"
              style={{ left: `${m.left}%` }}
            />
          ))}
          <div
            className="border-accent absolute top-0 bottom-0 border-l border-dashed"
            style={{ left: `${nowLeft}%` }}
          >
            <span className="text-accent font-mono text-[10px] whitespace-nowrap absolute -bottom-[18px] -translate-x-1/2">
              NOW
            </span>
          </div>
        </div>

        <div className="relative h-10">
          {milestones.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5"
              style={{ left: `${m.left}%` }}
            >
              <TrophyIcon />
              <span className="text-text-dim font-mono text-[11px] whitespace-nowrap">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-[30px] flex flex-col gap-7">
          {tracks.map((t) => (
            <div key={t.id} className="relative h-[26px]">
              <div
                className={`border-border absolute top-0 h-full rounded-[4px] border ${
                  t.colorClass === 'c2' ? 'bg-accent2-soft' : 'bg-accent-soft'
                }`}
                style={{ left: `${t.left}%`, width: `${t.width}%` }}
              >
                <div className="absolute -top-[22px] left-0 flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={`text-bg max-w-[160px] truncate rounded-[3px] px-[7px] py-0.5 font-mono text-[10px] font-bold ${
                      t.colorClass === 'c2' ? 'bg-accent2' : 'bg-accent'
                    }`}
                  >
                    {t.tag}
                  </span>
                  <span className="text-text text-xs">{t.label}</span>
                </div>
              </div>
              {t.subs.map((s) => (
                <div key={s.id}>
                  <div
                    className="bg-text-faint absolute top-0 h-full rounded-[4px] opacity-[0.55]"
                    style={{ left: `${s.left}%`, width: `${s.width}%` }}
                  />
                  <div
                    className="absolute -top-[22px] whitespace-nowrap"
                    style={{ left: `${s.left}%` }}
                  >
                    <span className="bg-text-faint text-bg max-w-[160px] truncate rounded-[3px] px-[7px] py-0.5 font-mono text-[10px] font-bold">
                      {s.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-border-soft relative mt-3.5 h-6 border-t">
        {axisYears.map((y, i) => (
          <span
            key={i}
            className="text-text-faint font-mono text-[11px] absolute top-2 -translate-x-1/2"
            style={{ left: `${y.left}%` }}
          >
            {y.label}
          </span>
        ))}
      </div>
    </div>
  )
}
