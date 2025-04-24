import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API /appointments | Method: ${req.method}`);
  if (req.method === 'POST') console.log('Request body:', req.body);

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .order('timeslot', { ascending: true });
        if (error) return res.status(400).json({ error: error.message });
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
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data);
      }
      // … PUT e DELETE conforme antes …
      default:
        res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch(err:any) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
