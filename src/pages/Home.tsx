import { useEffect, useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import { supabase } from '../lib/supabase'
import type { Award, Experience, Project, Skill } from '../types/database'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [projectsRes, skillsRes, awardsRes, experiencesRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('is_featured', true)
          .order('order_index', { ascending: true }),
        supabase.from('skills').select('*').order('order_index', { ascending: true }),
        supabase.from('awards').select('*').order('awarded_at', { ascending: false }),
        supabase.from('experiences').select('*').order('order_index', { ascending: true }),
      ])

      const firstError =
        projectsRes.error ?? skillsRes.error ?? awardsRes.error ?? experiencesRes.error
      if (firstError) {
        setError(firstError.message)
      } else {
        setProjects(projectsRes.data ?? [])
        setSkills(skillsRes.data ?? [])
        setAwards(awardsRes.data ?? [])
        setExperiences(experiencesRes.data ?? [])
      }
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-neutral-500">불러오는 중…</main>
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-red-600">
        데이터를 불러오지 못했습니다: {error}
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <section>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Projects</h1>
        {projects.length === 0 ? (
          <p className="mt-4 text-neutral-500">아직 등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Skills</h2>
        {skills.length === 0 ? (
          <p className="mt-4 text-neutral-500">아직 등록된 기술 스택이 없습니다.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Awards</h2>
        {awards.length === 0 ? (
          <p className="mt-4 text-neutral-500">아직 등록된 수상 내역이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {awards.map((award) => (
              <li key={award.id} className="text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">{award.title}</span> — {award.prize}
                {award.organizer && <span className="text-neutral-500"> ({award.organizer})</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Experiences</h2>
        {experiences.length === 0 ? (
          <p className="mt-4 text-neutral-500">아직 등록된 활동이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {experiences.map((experience) => (
              <li key={experience.id} className="text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">{experience.org_name}</span>
                {experience.role && <span> — {experience.role}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
