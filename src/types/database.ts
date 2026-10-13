// docs/data-model.md 및 Firebase Firestore 컬렉션 구조와 대응하는 타입.
// Firestore 문서 ID는 각 객체의 id로 매핑한다.

export interface Project {
  id: string
  slug: string
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

// ⚠️ DEPRECATED (ADR-010): 더 이상 사이트에서 조회하지 않음 — 상세 본문은
// content/projects/<slug>.md 로 관리한다. 테이블/타입은 당장 지우지 않고 남겨둠.
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

export type CertificateCategory = 'major' | 'language'

export interface Certificate {
  id: string
  category: CertificateCategory
  name: string
  issuer: string
  status: string
  certificate_number: string | null
  acquired_at: string
  valid_from: string | null
  valid_until: string | null
  order_index: number
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

export type ExperienceType = 'education' | 'military' | 'club' | 'intern' | 'activity'

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
