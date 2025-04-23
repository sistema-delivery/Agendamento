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
      <h2 className="text-xl font-semibold mb-4">Agendar Corte</h2>
      <input
        type="text"
        placeholder="Nome completo"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Telefone ou e-mail"
        value={contact}
        onChange={e => setContact(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <select
        value={service}
        onChange={e => setService(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      >
        <option>Corte</option>
        <option>Barba</option>
        <option>Corte + Barba</option>
      </select>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Agendando...' : 'Confirmar Agendamento'}
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </form>
  )
}
