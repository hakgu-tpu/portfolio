import { collection, getDocs, query, where } from 'firebase/firestore/lite'
import { db } from './firebase'
import type { Award, Certificate, Experience, Project, ProjectSkill, Skill } from '../types/database'

function documents<T>(collectionName: string) {
  return getDocs(collection(db, collectionName)).then((snapshot) =>
    snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as T),
  )
}

export async function getHomeData() {
  const [allProjects, projectSkills, skills, awards, experiences, certificates] = await Promise.all([
    documents<Project>('projects'),
    documents<ProjectSkill>('project_skills'),
    documents<Skill>('skills'),
    documents<Award>('awards'),
    documents<Experience>('experiences'),
    documents<Certificate>('certificates'),
  ])

  return {
    projects: allProjects
      .filter((project) => project.is_featured)
      .sort((a, b) => a.order_index - b.order_index),
    projectSkills,
    skills: skills.sort((a, b) => a.order_index - b.order_index),
    awards: awards.sort((a, b) => b.awarded_at.localeCompare(a.awarded_at)),
    experiences: experiences.sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? '')),
    certificates: certificates.sort((a, b) => a.order_index - b.order_index),
  }
}

export async function getProjectData(slug: string) {
  const projectSnapshot = await getDocs(
    query(collection(db, 'projects'), where('slug', '==', slug)),
  )
  const projectDocument = projectSnapshot.docs[0]

  if (!projectDocument) return null

  const project = { id: projectDocument.id, ...projectDocument.data() } as Project
  const [skills, awards] = await Promise.all([
    getDocs(query(collection(db, 'project_skills'), where('project_id', '==', project.id))),
    getDocs(query(collection(db, 'awards'), where('project_id', '==', project.id))),
  ])

  return {
    project,
    skills: skills.docs.map((document) => ({ id: document.id, ...document.data() }) as ProjectSkill),
    award: awards.docs[0]
      ? ({ id: awards.docs[0].id, ...awards.docs[0].data() } as Award)
      : null,
  }
}
