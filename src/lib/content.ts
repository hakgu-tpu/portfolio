// 프로젝트 상세 본문은 Supabase가 아니라 저장소의 content/projects/<slug>.md 로 관리한다.
// (docs/decisions.md ADR-010 참고) — 빌드 타임에 정적으로 번들링된다.

const projectMarkdownFiles = import.meta.glob('/content/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export function getProjectMarkdown(slug: string): string | null {
  const entry = Object.entries(projectMarkdownFiles).find(([path]) =>
    path.endsWith(`/${slug}.md`),
  )
  return entry?.[1] ?? null
}
