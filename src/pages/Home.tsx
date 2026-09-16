import { useEffect, useState } from 'react'
import HistoryTimeline from '../components/HistoryTimeline'
import ProjectCard from '../components/ProjectCard'
import { supabase } from '../lib/supabase'
import type { Award, Experience, Project, ProjectSkill, Skill } from '../types/database'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-accent font-mono text-[13px] mb-5 flex items-center gap-2.5 tracking-wide">
      <span className="bg-accent block h-px w-[18px]" />
      {children}
    </div>
  )
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectSkills, setProjectSkills] = useState<ProjectSkill[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [projectsRes, projectSkillsRes, skillsRes, awardsRes, experiencesRes] =
        await Promise.all([
          supabase
            .from('projects')
            .select('*')
            .eq('is_featured', true)
            .order('order_index', { ascending: true }),
          supabase.from('project_skills').select('*'),
          supabase.from('skills').select('*').order('order_index', { ascending: true }),
          supabase.from('awards').select('*').order('awarded_at', { ascending: false }),
          supabase.from('experiences').select('*').order('start_date', { ascending: true }),
        ])

      const firstError =
        projectsRes.error ??
        projectSkillsRes.error ??
        skillsRes.error ??
        awardsRes.error ??
        experiencesRes.error
      if (firstError) {
        setError(firstError.message)
      } else {
        setProjects(projectsRes.data ?? [])
        setProjectSkills(projectSkillsRes.data ?? [])
        setSkills(skillsRes.data ?? [])
        setAwards(awardsRes.data ?? [])
        setExperiences(experiencesRes.data ?? [])
      }
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-text-faint">불러오는 중…</main>
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-red-400">
        데이터를 불러오지 못했습니다: {error}
      </main>
    )
  }

  const skillGroups = Object.entries(
    skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      ;(acc[skill.category] ??= []).push(skill)
      return acc
    }, {}),
  )

  return (
    <div>
      <nav className="border-border-soft bg-bg/85 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex max-w-[880px] items-center justify-between px-8 py-7">
          <div className="text-text font-mono text-sm">
            [<span className="text-accent">이상진</span>.dev]
          </div>
          <div className="flex gap-7">
            {['history', 'projects', 'skills', 'awards', 'experiences'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-text-dim hover:text-accent font-mono text-[13px]"
              >
                {id}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[880px] px-8">
        <header className="py-24 pb-22">
          <Eyebrow>PORTFOLIO</Eyebrow>
          <h1 className="text-text-faint mb-5 text-[52px] leading-[1.12] font-bold tracking-[-0.02em] text-wrap-pretty">
            <span className="text-text">이상진</span>, 백엔드 · 인프라 엔지니어
          </h1>
          <p className="text-text-dim mb-7 max-w-[560px] text-[19px] leading-relaxed">
            Spring Boot로 서비스를 만들고 Kubernetes 위에서 운영하는 것까지 책임집니다. 배포
            파이프라인과 관측 환경을 함께 설계합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Java', 'Spring Boot', 'Kubernetes', 'Envoy Gateway', 'GitHub Actions'].map((t) => (
              <div
                key={t}
                className="border-border text-text-dim rounded-[4px] border px-3 py-1.5 font-mono text-xs"
              >
                {t}
              </div>
            ))}
          </div>
        </header>

        <section id="history" className="border-border-soft border-t py-18">
          <Eyebrow>01 / HISTORY</Eyebrow>
          {experiences.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 이력이 없습니다.</p>
          ) : (
            <HistoryTimeline experiences={experiences} awards={awards} projects={projects} />
          )}
        </section>

        <section id="projects" className="border-border-soft border-t py-18">
          <Eyebrow>02 / PROJECTS</Eyebrow>
          {projects.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 프로젝트가 없습니다.</p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  skills={projectSkills.filter((s) => s.project_id === project.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section id="skills" className="border-border-soft border-t py-18">
          <Eyebrow>03 / SKILLS</Eyebrow>
          {skillGroups.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 기술 스택이 없습니다.</p>
          ) : (
            <div className="mt-8 flex flex-col gap-[22px]">
              {skillGroups.map(([category, items]) => (
                <div key={category} className="flex items-baseline gap-5">
                  <div className="text-text-faint w-24 shrink-0 font-mono text-xs">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill.id}
                        className={`rounded-full border px-3.5 py-1.5 text-[13.5px] ${
                          skill.level === 'main'
                            ? 'border-accent bg-accent-soft text-text'
                            : 'border-border text-text-dim'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="awards" className="border-border-soft border-t py-18">
          <Eyebrow>04 / AWARDS</Eyebrow>
          {awards.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 수상 내역이 없습니다.</p>
          ) : (
            <div className="mt-6 flex flex-col">
              {awards.map((award, i) => (
                <div
                  key={award.id}
                  className={`flex items-center gap-6 py-[18px] ${i > 0 ? 'border-border-soft border-t' : ''}`}
                >
                  <div className="text-text-faint w-16 shrink-0 font-mono text-[12.5px]">
                    {new Date(award.awarded_at).getFullYear()}
                  </div>
                  <div className="flex grow flex-col gap-1">
                    <div className="text-text text-[15px] font-medium">{award.title}</div>
                    <div className="text-text-faint text-[13px]">{award.organizer}</div>
                  </div>
                  <div className="text-accent shrink-0 text-right font-mono text-xs">
                    {award.prize}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="experiences" className="border-border-soft border-t py-18">
          <Eyebrow>05 / EXPERIENCES</Eyebrow>
          {experiences.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 활동이 없습니다.</p>
          ) : (
            <div className="mt-6 flex flex-col">
              {experiences.map((experience, i) => (
                <div
                  key={experience.id}
                  className={`flex items-center gap-6 py-[18px] ${i > 0 ? 'border-border-soft border-t' : ''}`}
                >
                  <div className="text-text-faint w-16 shrink-0 font-mono text-[12.5px]">
                    {experience.start_date?.slice(2, 7).replace('-', '.')}
                  </div>
                  <div className="flex grow flex-col gap-1">
                    <div className="text-text text-[15px] font-medium">{experience.org_name}</div>
                    {experience.description && (
                      <div className="text-text-faint text-[13px]">{experience.description}</div>
                    )}
                  </div>
                  {experience.role && (
                    <div className="text-accent shrink-0 text-right font-mono text-xs">
                      {experience.role}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="py-15 pb-10">
          <p className="text-text-faint font-mono text-xs">
            © {new Date().getFullYear()} — Supabase 데이터로 구동되는 정적 사이트
          </p>
        </footer>
      </main>
    </div>
  )
}
