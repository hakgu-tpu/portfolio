import { useEffect, useState } from 'react'
import HistoryTimeline from '../components/HistoryTimeline'
import ProjectCard from '../components/ProjectCard'
import { getHomeData } from '../lib/data'
import type { Award, Certificate, Experience, Project, ProjectSkill, Skill } from '../types/database'

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
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
       try {
         const data = await getHomeData()
         setProjects(data.projects)
         setProjectSkills(data.projectSkills)
         setSkills(data.skills)
         setAwards(data.awards)
         setExperiences(data.experiences)
         setCertificates(data.certificates)
       } catch (caughtError) {
         setError(caughtError instanceof Error ? caughtError.message : '알 수 없는 오류가 발생했습니다.')
       } finally {
         setLoading(false)
       }
    }

    load()
  }, [])

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-text-faint">불러오는 중…</main>
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-red-600">
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
        <div className="mx-auto flex max-w-[880px] items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5">
          <a href="#" className="shrink-0" aria-label="idealreal.me — 맨 위로">
            <img src="/logo.svg" alt="idealreal.me" width={868} height={404} className="h-8 w-auto sm:h-9" />
          </a>
          <div className="flex gap-3 overflow-x-auto sm:gap-7">
            {['history', 'projects', 'skills', 'certificates', 'awards', 'experiences'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-text-dim hover:text-accent shrink-0 font-mono text-[11px] sm:text-[13px]"
              >
                {id}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[880px] px-5 sm:px-8">
        <header className="py-14 sm:py-24 sm:pb-22">
          <Eyebrow>PORTFOLIO</Eyebrow>
          <h1 className="text-text-faint mb-5 text-[34px] leading-[1.15] font-bold tracking-[-0.02em] text-wrap-pretty sm:text-[52px] sm:leading-[1.12]">
            <span className="text-text">이상진</span>, 백엔드 · 인프라 엔지니어
          </h1>
          <p className="text-text-dim mb-7 max-w-[560px] text-base leading-relaxed sm:text-[19px]">
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

        <section id="history" className="border-border-soft border-t py-12 sm:py-18">
          <Eyebrow>01 / HISTORY</Eyebrow>
          {experiences.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 이력이 없습니다.</p>
          ) : (
            <HistoryTimeline experiences={experiences} awards={awards} projects={projects} />
          )}
        </section>

        <section id="projects" className="border-border-soft border-t py-12 sm:py-18">
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

        <section id="skills" className="border-border-soft border-t py-12 sm:py-18">
          <Eyebrow>03 / SKILLS</Eyebrow>
          {skillGroups.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 기술 스택이 없습니다.</p>
          ) : (
            <div className="mt-8 flex flex-col gap-[22px]">
              {skillGroups.map(([category, items]) => (
                <div key={category} className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
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

        <section id="certificates" className="border-border-soft border-t py-12 sm:py-18">
          <Eyebrow>04 / CERTIFICATES</Eyebrow>
          {certificates.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 자격증이 없습니다.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-8">
              {[
                ['major', '전공 관련 자격증'],
                ['language', '어학 자격증'],
              ].map(([category, title]) => {
                const items = certificates.filter((certificate) => certificate.category === category)
                if (items.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="text-text mb-3 font-mono text-sm">{title}</h3>
                    <div className="border-border-soft overflow-x-auto border-y">
                      <table className="min-w-[680px] w-full text-left text-[13px]">
                        <thead className="text-text-faint font-mono text-[11px]">
                          <tr>
                            <th className="py-3 pr-4 font-normal">취득·합격일</th>
                            <th className="py-3 pr-4 font-normal">자격증</th>
                            <th className="py-3 pr-4 font-normal">발급기관</th>
                            <th className="py-3 pr-4 font-normal">상태</th>
                            <th className="py-3 pr-4 font-normal">자격번호</th>
                            <th className="py-3 font-normal">인정기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((certificate) => (
                            <tr key={certificate.id} className="border-border-soft border-t">
                              <td className="text-text-dim py-3.5 pr-4 font-mono text-xs whitespace-nowrap">
                                {certificate.acquired_at}
                              </td>
                              <td className="text-text py-3.5 pr-4 font-medium whitespace-nowrap">{certificate.name}</td>
                              <td className="text-text-dim py-3.5 pr-4 whitespace-nowrap">{certificate.issuer}</td>
                              <td className="text-accent py-3.5 pr-4 whitespace-nowrap">{certificate.status}</td>
                              <td className="text-text-faint py-3.5 pr-4 font-mono text-xs whitespace-nowrap">
                                {certificate.certificate_number ?? '—'}
                              </td>
                              <td className="text-text-faint py-3.5 font-mono text-xs whitespace-nowrap">
                                {certificate.valid_from
                                  ? `${certificate.valid_from} – ${certificate.valid_until ?? '평생'}`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section id="awards" className="border-border-soft border-t py-12 sm:py-18">
          <Eyebrow>05 / AWARDS</Eyebrow>
          {awards.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 수상 내역이 없습니다.</p>
          ) : (
            <div className="mt-6 flex flex-col">
              {awards.map((award, i) => (
                <div
                  key={award.id}
                  className={`flex flex-col gap-1.5 py-[18px] sm:flex-row sm:items-center sm:gap-6 sm:gap-y-0 ${i > 0 ? 'border-border-soft border-t' : ''}`}
                >
                  <div className="text-text-faint font-mono text-[12.5px] sm:w-16 sm:shrink-0">
                    {new Date(award.awarded_at).getFullYear()}
                  </div>
                  <div className="flex grow flex-col gap-1">
                    <div className="text-text text-[15px] font-medium">{award.title}</div>
                    <div className="text-text-faint text-[13px]">{award.organizer}</div>
                  </div>
                  <div className="text-accent font-mono text-xs sm:shrink-0 sm:text-right">
                    {award.prize}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="experiences" className="border-border-soft border-t py-12 sm:py-18">
          <Eyebrow>06 / EXPERIENCES</Eyebrow>
          {experiences.length === 0 ? (
            <p className="text-text-faint mt-4">아직 등록된 활동이 없습니다.</p>
          ) : (
            <div className="mt-6 flex flex-col">
              {experiences.map((experience, i) => (
                <div
                  key={experience.id}
                  className={`flex flex-col gap-1.5 py-[18px] sm:flex-row sm:items-center sm:gap-6 sm:gap-y-0 ${i > 0 ? 'border-border-soft border-t' : ''}`}
                >
                  <div className="text-text-faint font-mono text-[12.5px] sm:w-16 sm:shrink-0">
                    {experience.start_date?.slice(2, 7).replace('-', '.')}
                  </div>
                  <div className="flex grow flex-col gap-1">
                    <div className="text-text text-[15px] font-medium">{experience.org_name}</div>
                    {experience.description && (
                      <div className="text-text-faint text-[13px]">{experience.description}</div>
                    )}
                  </div>
                  {experience.role && (
                    <div className="text-accent font-mono text-xs sm:shrink-0 sm:text-right">
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
            © {new Date().getFullYear()} — Firestore 데이터로 구동되는 정적 사이트
          </p>
        </footer>
      </main>
    </div>
  )
}
