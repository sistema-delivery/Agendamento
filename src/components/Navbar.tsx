// src/components/Navbar.tsx
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold">Barber’s Agenda</a>
        </Link>
        <div className="space-x-4">
          <Link href="/agendar"><a>Agendar</a></Link>
          <Link href="/dashboard"><a>Meus Agendamentos</a></Link>
        </div>
      </div>
    </nav>
  )
}
