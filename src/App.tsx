import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'

const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/projects/:slug"
        element={
          <Suspense fallback={<main className="text-text-faint mx-auto max-w-[760px] px-5 py-16 sm:px-8">불러오는 중…</main>}>
            <ProjectDetail />
          </Suspense>
        }
      />
    </Routes>
  )
}
