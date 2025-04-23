import { useState } from 'react'
import supabase from '../lib/supabaseClient'

export default function AppointmentForm() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [service, setService] = useState('Corte')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('appointments')
      .insert([{ name, contact, service, date, timeslot: date }])
    setLoading(false)

    if (error) {
      setMessage('Erro ao agendar: ' + error.message)
    } else {
      setMessage('Agendamento realizado com sucesso!')
      setName('')
      setContact('')
      setDate('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      {/* ...seu form aqui... */}
    </form>
  )
}
