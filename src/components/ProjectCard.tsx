import { Link } from 'react-router-dom'
import type { Project } from '../types/database'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{project.name}</h3>
      {project.description && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{project.description}</p>
      )}
      {project.role && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">{project.role}</p>
      )}
    </Link>
  )
}
