import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        // Retorna todos os agendamentos (ou filtre pelo usuário/barbearia)
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .order('timeslot', { ascending: true });

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'POST': {
        // Cria um novo agendamento
        const { name, contact, service, date, timeslot } = req.body;

        // Validação básica
        if (!name || !contact || !service || !date || !timeslot) {
          return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert([{ name, contact, service, date, timeslot }])
          .single();

        if (error) throw error;
        return res.status(201).json(data);
      }

      case 'PUT': {
        // Atualiza status ou edição de agendamento
        const { id, status, service, date, timeslot } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });
        }

        const updates: Record<string, any> = {};
        if (status) updates.status = status;
        if (service) updates.service = service;
        if (date) updates.date = date;
        if (timeslot) updates.timeslot = timeslot;

        const { data, error } = await supabase
          .from('appointments')
          .update(updates)
          .eq('id', id)
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'DELETE': {
        // Deleta um agendamento
        const { id } = req.query;
        if (!id || Array.isArray(id)) {
          return res.status(400).json({ error: 'ID inválido.' });
        }

        const { data, error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id)
          .single();

        if (error) throw error;
        return res.status(200).json({ deleted: true, data });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API /appointments error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
