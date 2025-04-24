import React, { useState } from 'react';

export default function AppointmentForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [service, setService] = useState('Corte');
  const [date, setDate] = useState('');
  const [timeslot, setTimeslot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = { name, contact, service, date, timeslot };
    console.log('Attempting to schedule appointment, payload:', payload);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('API response status:', res.status);

      let result: any;
      try {
        result = await res.json();
        console.log('API response JSON:', result);
      } catch {
        const text = await res.text();
        console.log('API response text:', text);
        result = {};
      }

      if (!res.ok) {
        const errMsg = result.error || result.details || 'Erro desconhecido';
        setMessage('Erro ao agendar: ' + errMsg);
      } else {
        setMessage('Agendamento realizado com sucesso!');
        setName('');
        setContact('');
        setService('Corte');
        setDate('');
        setTimeslot('');
      }
    } catch (err: any) {
      console.error('Network error ao agendar:', err);
      setMessage('Erro de rede ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Agendar horário</h2>

      <label className="block mb-1">Nome</label>
      <input
        type="text"
        placeholder="Nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />

      <label className="block mb-1">Contato</label>
      <input
        type="text"
        placeholder="Telefone ou e-mail"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />

      <label className="block mb-1">Serviço</label>
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      >
        <option value="Corte">Corte</option>
        <option value="Barba">Barba</option>
        <option value="Corte + Barba">Corte + Barba</option>
      </select>

      <label className="block mb-1">Data</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />

      <label className="block mb-1">Horário</label>
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Selecione um horário</option>
        <option value="09:00">09:00</option>
        <option value="10:00">10:00</option>
        <option value="11:00">11:00</option>
        <option value="12:00">12:00</option>
        <option value="13:00">13:00</option>
        <option value="14:00">14:00</option>
        <option value="15:00">15:00</option>
        <option value="16:00">16:00</option>
        <option value="17:00">17:00</option>
        <option value="18:00">18:00</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Agendando...' : 'Confirmar Agendamento'}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </form>
  );
}
