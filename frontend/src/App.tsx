import { Routes, Route, NavLink } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { InvoiceLibrary } from './pages/InvoiceLibrary'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-3 text-sm font-medium ${
                  isActive ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/biblioteca"
              className={({ isActive }) =>
                `flex items-center px-3 text-sm font-medium ${
                  isActive ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Biblioteca de Faturas
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/biblioteca" element={<InvoiceLibrary />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
