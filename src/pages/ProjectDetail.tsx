import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Project, ProjectDetail as ProjectDetailRow, ProjectSkill } from '../types/database'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [detail, setDetail] = useState<ProjectDetailRow | null>(null)
  const [skills, setSkills] = useState<ProjectSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      const [projectRes, detailRes, skillsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_details').select('*').eq('project_id', id).maybeSingle(),
        supabase.from('project_skills').select('*').eq('project_id', id),
      ])

      if (projectRes.error) {
        setError(projectRes.error.message)
      } else {
        setProject(projectRes.data)
        setDetail(detailRes.data ?? null)
        setSkills(skillsRes.data ?? [])
      }
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-500">불러오는 중…</main>
  }

  if (error || !project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-red-600">프로젝트를 찾을 수 없습니다{error ? `: ${error}` : ''}.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-neutral-500 underline">
          ← 목록으로
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="text-sm text-neutral-500 underline">
        ← 목록으로
      </Link>

      <h1 className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
        {project.name}
      </h1>
      {project.description && (
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{project.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
        {project.role && <span>역할: {project.role}</span>}
        {project.team_size && <span>팀 규모: {project.team_size}명</span>}
        {project.start_date && (
          <span>
            기간: {project.start_date} ~ {project.end_date ?? '진행 중'}
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        {project.service_url && (
          <a href={project.service_url} target="_blank" rel="noreferrer" className="underline">
            서비스 링크
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noreferrer" className="underline">
            GitHub
          </a>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
            >
              {skill.skill_name}
            </span>
          ))}
        </div>
      )}

      {detail ? (
        <div className="mt-12 space-y-8">
          {detail.background && (
            <section>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">기획 배경</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                {detail.background}
              </p>
            </section>
          )}
          {detail.tech_detail && (
            <section>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                기술적 구현 상세
              </h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                {detail.tech_detail}
              </p>
            </section>
          )}
          {detail.challenges && (
            <section>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                어려웠던 점 & 해결
              </h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                {detail.challenges}
              </p>
            </section>
          )}
          {detail.learned && (
            <section>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">배운 점</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                {detail.learned}
              </p>
            </section>
          )}
          {detail.architecture && (
            <section>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">아키텍처</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                {detail.architecture}
              </p>
            </section>
          )}
        </div>
      ) : (
        <p className="mt-12 text-neutral-500">아직 상세 설명이 등록되지 않았습니다.</p>
      )}
    </main>
  )
}
