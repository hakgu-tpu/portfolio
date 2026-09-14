// docs/data-model.md 및 supabase/schema.sql 과 1:1로 대응하는 타입.
// 스키마가 바뀌면 이 파일도 함께 갱신할 것 (schema.sql이 원본).

export interface Project {
  id: string
  name: string
  description: string | null
  role: string | null
  team_size: number | null
  start_date: string | null
  end_date: string | null
  service_url: string | null
  github_url: string | null
  is_featured: boolean
  order_index: number
  created_at: string
}

export interface ProjectDetail {
  id: string
  project_id: string
  background: string | null
  tech_detail: string | null
  challenges: string | null
  learned: string | null
  architecture: string | null
  created_at: string
}

export interface ProjectSkill {
  id: string
  project_id: string
  skill_name: string
  is_my_part: boolean
}

export interface Award {
  id: string
  title: string
  prize: string
  organizer: string | null
  awarded_at: string
  project_id: string | null
  order_index: number
  created_at: string
}

export type SkillCategory = 'Language' | 'Framework' | 'Database' | 'DevOps' | 'Tools'
export type SkillLevel = 'main' | 'sub'

export interface Skill {
  id: string
  category: SkillCategory
  name: string
  level: SkillLevel | null
  order_index: number
}

export type ExperienceType = 'club' | 'intern' | 'activity'

export interface Experience {
  id: string
  type: ExperienceType
  org_name: string
  role: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  order_index: number
}

// 사이트에서 사용하는 유일한 쓰기(insert) 대상.
export interface ContactInsert {
  name: string
  email: string
  message: string
}
