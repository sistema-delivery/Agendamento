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
        if (!id) {
          return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });
        }

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

        const { error } = await supabase
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
  } catch (err: any) {
    console.error('API /appointments error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
