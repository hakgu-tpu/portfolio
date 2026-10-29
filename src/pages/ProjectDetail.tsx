import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import ProfileLinks from '../components/ProfileLinks'
import { getProjectMarkdown } from '../lib/content'
import { getLinks, getProjectData } from '../lib/data'
import type { Award, ProfileLink, Project, ProjectSkill } from '../types/database'

function formatDate(d: string) {
  return d.slice(2, 7).replace('-', '.')
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [skills, setSkills] = useState<ProjectSkill[]>([])
  const [award, setAward] = useState<Award | null>(null)
  const [links, setLinks] = useState<ProfileLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getLinks().then(setLinks)
  }, [])

  useEffect(() => {
    if (!slug) return
    const projectSlug = slug

    async function load() {
      try {
         const data = await getProjectData(projectSlug)
         if (!data) {
           setError('프로젝트를 찾을 수 없습니다.')
           return
         }
         setProject(data.project)
         setSkills(data.skills)
         setAward(data.award)
       } catch (caughtError) {
         setError(caughtError instanceof Error ? caughtError.message : '알 수 없는 오류가 발생했습니다.')
       } finally {
         setLoading(false)
       }
    }

    load()
  }, [slug])

  if (loading) {
    return <main className="mx-auto max-w-[760px] px-5 py-16 text-text-faint sm:px-8">불러오는 중…</main>
  }

  if (error || !project) {
    return (
      <main className="mx-auto max-w-[760px] px-5 py-16 sm:px-8">
        <p className="text-red-600">프로젝트를 찾을 수 없습니다{error ? `: ${error}` : ''}.</p>
        <Link to="/" className="text-text-dim mt-4 inline-block text-sm underline">
          ← projects
        </Link>
      </main>
    )
  }

  const markdown = getProjectMarkdown(project.slug)

  return (
    <div>
      <nav className="border-border-soft bg-bg/85 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto max-w-[760px] px-5 py-7 sm:px-8">
          <Link
            to="/"
            className="text-text-dim hover:text-accent inline-flex items-center gap-2 font-mono text-[13px]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            projects
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[760px] px-5 sm:px-8">
        <header className="pt-10 pb-10 sm:pt-14">
          <div className="text-accent font-mono text-[13px] mb-4.5 flex items-center gap-2.5 tracking-wide">
            <span className="bg-accent block h-px w-[18px]" />
            PROJECT
          </div>
          <h1 className="text-text mb-3.5 text-[32px] leading-tight font-bold tracking-[-0.02em] sm:text-[42px]">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-text-dim mb-7 max-w-[560px] text-base leading-relaxed sm:text-[17px]">
              {project.description}
            </p>
          )}

          <div className="border-border-soft mb-6 grid grid-cols-1 gap-5 border-y py-5 sm:grid-cols-3">
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
            <div className="mb-5 flex flex-wrap gap-3">
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
                AWARD ·{' '}
                <b className="text-text font-medium">
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
                  className="bg-accent-soft text-accent rounded px-3 py-1.5 font-mono text-xs"
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          )}
        </header>

        {markdown ? (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-text-faint border-border-soft border-t py-10">
            아직 상세 설명이 등록되지 않았습니다.
          </p>
        )}

        <footer className="flex flex-col gap-4 py-12">
          <ProfileLinks links={links} variant="footer" />
          <p className="text-text-faint font-mono text-xs">
            © {new Date().getFullYear()} — Firestore 데이터로 구동되는 정적 사이트
          </p>
        </footer>
      </main>
    </div>
  )
}
