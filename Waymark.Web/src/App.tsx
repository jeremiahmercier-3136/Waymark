import { Route, Routes } from 'react-router-dom'
import { CatalogPage } from './pages/CatalogPage'
import { MarkerRoute } from './pages/MarkerRoute'

export function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/markers/:id" element={<MarkerRoute />} />
      </Routes>
    </main>
  )
}
