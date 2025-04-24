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

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, service, date, timeslot }),
      });
      const result = await res.json();

      console.log('API response status:', res.status);
      console.log('API response body:', result);

      if (!res.ok) {
        // Exibe mensagem de erro detalhada ou genérica
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
  }; (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, service, date, timeslot }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || JSON.stringify(result));
      }

      setMessage('Agendamento realizado com sucesso!');
      setName('');
      setContact('');
      setService('');
      setDate('');
      setTimeslot('');
    } catch (err: any) {
      console.error('Erro ao agendar:', err);
      setMessage('Erro ao agendar: ' + (err.message || err));
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
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full mb-4 p-2 border rounded"
        placeholder="Nome do cliente"
      />

      <label className="block mb-1">Contato</label>
      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        className="w-full mb-4 p-2 border rounded"
        placeholder="Telefone ou e-mail"
      />

      <label className="block mb-1">Serviço</label>
      <input
        type="text"
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
        className="w-full mb-4 p-2 border rounded"
        placeholder="Corte de cabelo, barba, etc."
      />

      <label className="block mb-1">Data</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full mb-4 p-2 border rounded"
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
        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Agendando...' : 'Agendar'}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </form>
  );
}

// pages/api/appointments.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .order('timeslot', { ascending: true });

        if (error) {
          return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
        }
        return res.status(200).json(data);
      }

      case 'POST': {
        const { name, contact, service, date, timeslot } = req.body;
        if (!name || !contact || !service || !date || !timeslot) {
          return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert([{ name, contact, service, date, timeslot }])
          .single();

        if (error) {
          return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
        }
        return res.status(201).json(data);
      }

      case 'PUT': {
        const { id, status, service: svc, date: dt, timeslot: ts } = req.body;
        if (!id) return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });

        const updates: Record<string, any> = {};
        if (status) updates.status = status;
        if (svc) updates.service = svc;
        if (dt) updates.date = dt;
        if (ts) updates.timeslot = ts;

        const { data, error } = await supabase
          .from('appointments')
          .update(updates)
          .eq('id', id)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
        }
        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || Array.isArray(id)) {
          return res.status(400).json({ error: 'ID inválido.' });
        }

        const { data, error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
        }
        return res.status(200).json({ deleted: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('API /appointments error:', error.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
