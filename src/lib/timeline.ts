// History 타임라인 좌표 계산 — 하드코딩된 위치값 없이 실제 날짜 데이터로부터 퍼센트 좌표를 도출한다.
// (docs/decisions.md ADR-008 참고)

import type { Award, Experience, Project } from '../types/database'

function toDecimalYear(d: Date): number {
  const yearStart = new Date(d.getFullYear(), 0, 1).getTime()
  const yearEnd = new Date(d.getFullYear() + 1, 0, 1).getTime()
  return d.getFullYear() + (d.getTime() - yearStart) / (yearEnd - yearStart)
}

export interface TimelineScale {
  pct: (d: Date) => number
  domainMin: number
  domainMax: number
}

export function buildScale(dates: Date[], now: Date): TimelineScale {
  const years = dates.map(toDecimalYear)
  years.push(toDecimalYear(now))
  const min = Math.min(...years)
  const max = Math.max(...years)
  const span = max - min || 1
  const domainMin = min - span * 0.03
  const domainMax = max + span * 0.03
  const domainSpan = domainMax - domainMin
  return {
    pct: (d) => ((toDecimalYear(d) - domainMin) / domainSpan) * 100,
    domainMin,
    domainMax,
  }
}

export interface TimelineSub {
  id: string
  tag: string
  left: number
  width: number
}

export interface TimelineTrack {
  id: string
  tag: string
  label: string
  left: number
  width: number
  colorClass: string
  subs: TimelineSub[]
}

export function buildTracks(experiences: Experience[], scale: TimelineScale, now: Date): TimelineTrack[] {
  const parsed = experiences.map((e) => ({
    ...e,
    start: new Date(e.start_date ?? now),
    end: e.end_date ? new Date(e.end_date) : now,
  }))

  // 오버레이(같은 트랙 안에 겹쳐 그리기)는 "같은 소속(org_name) 안에서 기간이 완전히
  // 포함될 때"만 적용한다 — 예: 자람 학회 회원 → 임원진(총무)은 같은 조직 내 역할 변화라
  // 겹쳐 그리는 게 맞지만, 한양대학교 재학과 군 복무는 날짜상 겹치더라도 서로 다른 소속이라
  // 항상 별도 트랙으로 분리한다.
  const isContainedBy = (a: (typeof parsed)[number], b: (typeof parsed)[number]) =>
    a.id !== b.id && a.org_name === b.org_name && a.start >= b.start && a.end <= b.end

  const bases = parsed.filter((r) => !parsed.some((other) => isContainedBy(r, other)))

  return bases.map((b, i) => {
    const left = scale.pct(b.start)
    const width = scale.pct(b.end) - left
    const subs = parsed
      .filter((r) => r.id !== b.id && isContainedBy(r, b))
      .map((s) => {
        const sLeft = scale.pct(s.start)
        return { id: s.id, tag: s.role ?? s.org_name, left: sLeft, width: scale.pct(s.end) - sLeft }
      })
    return {
      id: b.id,
      tag: b.role ?? b.org_name,
      label: b.org_name,
      left,
      width,
      colorClass: i % 2 === 0 ? '' : 'c2',
      subs,
    }
  })
}

export interface TimelineMilestone {
  left: number
  label: string
}

function groupByYear<T>(items: T[], dateOf: (item: T) => string | null, label: (count: number) => string, scale: TimelineScale): TimelineMilestone[] {
  // 연도별로 묶되, 위치는 그 해의 1월 1일이 아니라 그룹 내 가장 이른 실제 날짜를 쓴다 —
  // 그래야 같은 해에 속한 서로 다른 종류의 마일스톤(예: 수상 vs 프로젝트)이 우연히 같은
  // 좌표에 겹치지 않고, 실제 데이터 분포에 더 가깝게 표시된다.
  const byYear = new Map<number, { count: number; earliest: Date }>()
  for (const item of items) {
    const raw = dateOf(item)
    if (!raw) continue
    const date = new Date(raw)
    const year = date.getFullYear()
    const existing = byYear.get(year)
    if (existing) {
      existing.count += 1
      if (date < existing.earliest) existing.earliest = date
    } else {
      byYear.set(year, { count: 1, earliest: date })
    }
  }
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, { count, earliest }]) => ({
      left: scale.pct(earliest),
      label: label(count),
    }))
}

export function buildMilestones(awards: Award[], projects: Project[], scale: TimelineScale): TimelineMilestone[] {
  const awardMilestones = groupByYear(awards, (a) => a.awarded_at, (n) => `수상 ${n}건`, scale)
  const projectMilestones = groupByYear(projects, (p) => p.start_date, (n) => `프로젝트 ${n}건`, scale)
  return [...awardMilestones, ...projectMilestones].sort((a, b) => a.left - b.left)
}

export interface AxisYear {
  left: number
  label: string
}

export function buildAxisYears(scale: TimelineScale): AxisYear[] {
  const years: AxisYear[] = []
  for (let y = Math.ceil(scale.domainMin); y <= Math.floor(scale.domainMax); y++) {
    years.push({ left: scale.pct(new Date(`${y}-01-01`)), label: `'${String(y).slice(2)}` })
  }
  return years
}
