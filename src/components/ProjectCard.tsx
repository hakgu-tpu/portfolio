import { Link } from 'react-router-dom'
import type { Project, ProjectSkill } from '../types/database'

function formatPeriod(project: Project) {
  const fmt = (d: string) => d.slice(2, 7).replace('-', '.')
  if (!project.start_date) return null
  const end = project.end_date ? fmt(project.end_date) : '진행중'
  return `${project.team_size ? `${project.team_size}인 · ` : ''}${fmt(project.start_date)} – ${end}`
}

export default function ProjectCard({
  project,
  skills,
}: {
  project: Project
  skills: ProjectSkill[]
}) {
  const period = formatPeriod(project)

  return (
    <Link
      to={`/projects/${project.id}`}
      className="border-border hover:border-accent bg-bg-raised flex flex-col gap-4 rounded-lg border p-6 transition"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-text text-[19px] font-semibold">{project.name}</h3>
        {project.description && (
          <p className="text-text-dim grow text-sm leading-relaxed">{project.description}</p>
        )}
      </div>
      {project.role && <p className="text-text-faint text-[13px] leading-relaxed">{project.role}</p>}
      {period && <div className="text-accent font-mono text-[11px] tracking-wide">{period}</div>}
      {skills.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="bg-accent-soft text-accent rounded-[3px] px-2 py-1 font-mono text-[10.5px]"
            >
              {skill.skill_name}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
