import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type {
  Award,
  Project,
  ProjectDetail as ProjectDetailRow,
  ProjectSkill,
} from '../types/database'

function formatDate(d: string) {
  return d.slice(2, 7).replace('-', '.')
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [detail, setDetail] = useState<ProjectDetailRow | null>(null)
  const [skills, setSkills] = useState<ProjectSkill[]>([])
  const [award, setAward] = useState<Award | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      const [projectRes, detailRes, skillsRes, awardRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_details').select('*').eq('project_id', id).maybeSingle(),
        supabase.from('project_skills').select('*').eq('project_id', id),
        supabase.from('awards').select('*').eq('project_id', id).maybeSingle(),
      ])

      if (projectRes.error) {
        setError(projectRes.error.message)
      } else {
        setProject(projectRes.data)
        setDetail(detailRes.data ?? null)
        setSkills(skillsRes.data ?? [])
        setAward(awardRes.data ?? null)
      }
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) {
    return <main className="mx-auto max-w-[760px] px-8 py-16 text-text-faint">불러오는 중…</main>
  }

  if (error || !project) {
    return (
      <main className="mx-auto max-w-[760px] px-8 py-16">
        <p className="text-red-400">프로젝트를 찾을 수 없습니다{error ? `: ${error}` : ''}.</p>
        <Link to="/" className="text-text-dim mt-4 inline-block text-sm underline">
          ← projects
        </Link>
      </main>
    )
  }

  const sections = [
    { title: '기획 배경', body: detail?.background },
    { title: '기술적 구현 상세', body: detail?.tech_detail },
    { title: '어려웠던 점 & 해결', body: detail?.challenges },
    { title: '배운 점', body: detail?.learned },
    { title: '아키텍처', body: detail?.architecture },
  ].filter((s): s is { title: string; body: string } => Boolean(s.body))

  return (
    <div>
      <nav className="border-border-soft bg-bg/85 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto max-w-[760px] px-8 py-7">
          <Link to="/" className="text-text-dim hover:text-accent inline-flex items-center gap-2 font-mono text-[13px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            projects
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[760px] px-8">

      <header className="pt-14 pb-10">
        <div className="text-accent font-mono text-[13px] mb-4.5 flex items-center gap-2.5 tracking-wide">
          <span className="bg-accent block h-px w-[18px]" />
          PROJECT
        </div>
        <h1 className="text-text mb-3.5 text-[42px] leading-tight font-bold tracking-[-0.02em]">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-text-dim mb-7 max-w-[560px] text-[17px] leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="border-border-soft mb-6 grid grid-cols-3 gap-5 border-y py-5">
          {project.role && (
            <div className="flex flex-col gap-1.5">
              <div className="text-text-faint font-mono text-[11px] tracking-wide uppercase">
                Role
              </div>
              <div className="text-text text-[14.5px] leading-snug">{project.role}</div>
            </div>
          )}
          {project.team_size && (
            <div className="flex flex-col gap-1.5">
              <div className="text-text-faint font-mono text-[11px] tracking-wide uppercase">
                Team
              </div>
              <div className="text-text text-[14.5px] leading-snug">{project.team_size}인</div>
            </div>
          )}
          {project.start_date && (
            <div className="flex flex-col gap-1.5">
              <div className="text-text-faint font-mono text-[11px] tracking-wide uppercase">
                Period
              </div>
              <div className="text-text text-[14.5px] leading-snug">
                {formatDate(project.start_date)} –{' '}
                {project.end_date ? formatDate(project.end_date) : '진행중'}
              </div>
            </div>
          )}
        </div>

        {(project.service_url || project.github_url) && (
          <div className="mb-5 flex gap-3">
            {project.service_url && (
              <a
                href={project.service_url}
                target="_blank"
                rel="noreferrer"
                className="border-border text-text-dim hover:text-accent hover:border-accent rounded-[5px] border px-3.5 py-2 font-mono text-[12.5px]"
              >
                ↗ {project.service_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="border-border text-text-dim hover:text-accent hover:border-accent rounded-[5px] border px-3.5 py-2 font-mono text-[12.5px]"
              >
                ↗ GitHub
              </a>
            )}
          </div>
        )}

        {award && (
          <div className="bg-accent-soft border-border mb-10 inline-flex items-center gap-2.5 rounded-md border px-3.5 py-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent h-4 w-4 shrink-0"
            >
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
              <path d="M5 6H3a2 2 0 0 0 2 4M19 6h2a2 2 0 0 1-2 4" />
            </svg>
            <span className="text-text-dim font-mono text-xs">
              AWARD · <b className="text-text font-medium">
                {award.title} {award.prize}
              </b>{' '}
              ({new Date(award.awarded_at).getFullYear()})
            </span>
          </div>
        )}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="bg-accent-soft text-accent rounded font-mono text-xs px-3 py-1.5"
              >
                {skill.skill_name}
              </span>
            ))}
          </div>
        )}
      </header>

      {sections.length > 0 ? (
        <div className="flex flex-col">
          {sections.map((section, i) => (
            <div
              key={section.title}
              className="border-border-soft grid grid-cols-[64px_1fr] gap-6 border-t py-10"
            >
              <div className="text-text-faint pt-0.5 font-mono text-[13px]">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h2 className="text-text mb-3.5 text-xl font-semibold">{section.title}</h2>
                <p className="text-text-dim whitespace-pre-line text-[15px] leading-loose">
                  {section.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-faint border-border-soft border-t py-10">
          아직 상세 설명이 등록되지 않았습니다.
        </p>
      )}

        <footer className="py-12">
          <p className="text-text-faint font-mono text-xs">
            © {new Date().getFullYear()} — Supabase 데이터로 구동되는 정적 사이트
          </p>
        </footer>
      </main>
    </div>
  )
}
