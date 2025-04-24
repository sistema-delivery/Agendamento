// src/components/AppointmentForm.tsx
import React, { useState } from 'react';

export default function AppointmentForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [timeslot, setTimeslot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Debug: corpo do request
    const payload = { name, contact, service, date, timeslot };
    console.log('Attempting to schedule appointment, payload:', payload);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Log status
      console.log('API response status:', res.status);

      // Tentar ler JSON, mas se falhar, ler texto cru
      let result: any;
      try {
        result = await res.json();
        console.log('API response JSON:', result);
      } catch (jsonErr) {
        const text = await res.text();
        console.log('API response could not parse JSON. Raw text:', text);
        result = {};
      }

      if (!res.ok) {
        const errMsg = result.error || result.details || JSON.stringify(result) || 'Erro desconhecido';
        setMessage('Erro ao agendar: ' + errMsg);
        return;
      }

      setMessage('Agendamento realizado com sucesso!');
      setName('');
      setContact('');
      setService('');
      setDate('');
      setTimeslot('');
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

      {/* Campos do formulário */}
      {/* ...mesmo código dos inputs anterior... */}
    </form>
  );
}
