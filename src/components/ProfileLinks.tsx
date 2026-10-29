import type { ProfileLink } from '../types/database'

function LinkIcon({ kind }: { kind: string }) {
  if (kind === 'github') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    )
  }

  if (kind === 'velog') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M8.5 8.5 12 15.5l3.5-7" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

// hero: 히어로 영역의 테두리 버튼 / footer: 푸터의 작은 텍스트 링크
export default function ProfileLinks({
  links,
  variant,
}: {
  links: ProfileLink[]
  variant: 'hero' | 'footer'
}) {
  if (links.length === 0) return null

  const itemClass =
    variant === 'hero'
      ? 'border-border text-text-dim hover:text-accent hover:border-accent inline-flex items-center gap-2 rounded-[5px] border px-3.5 py-2 font-mono text-[12.5px]'
      : 'text-text-faint hover:text-accent inline-flex items-center gap-1.5 font-mono text-xs'

  return (
    <ul className={variant === 'hero' ? 'mt-6 flex flex-wrap gap-3' : 'flex flex-wrap gap-4'}>
      {links.map((link) => (
        <li key={link.id}>
          <a href={link.url} target="_blank" rel="noreferrer" className={itemClass}>
            <LinkIcon kind={link.kind} />
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
