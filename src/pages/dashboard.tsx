import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'

// Definição da interface de dados de agendamento
export interface Appointment {
  id: string
  name: string
  contact: string
  service: string
  date: string
  timeslot: string
  status: string
  created_at: string
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Consultando sem genéricos para evitar erro de tipagem
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
      } else if (data) {
        // Fazendo cast para Appointment[]
        setAppointments(data as Appointment[])
      }
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p className="p-4">Carregando agendamentos…</p>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Agendamentos</h1>

      {appointments.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map(a => (
            <li key={a.id} className="p-4 border rounded">
              <p><strong>Cliente:</strong> {a.name}</p>
              <p><strong>Contato:</strong> {a.contact}</p>
              <p><strong>Serviço:</strong> {a.service}</p>
              <p><strong>Data:</strong> {a.date}</p>
              <p><strong>Status:</strong> {a.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
