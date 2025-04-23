// src/pages/agendar.tsx
import Layout from '@/components/Layout'
import AppointmentForm from '@/components/AppointmentForm'  // 1) importe o form

export default function Agendar() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Agendar Corte</h1>
      <AppointmentForm />  {/* 2) renderize aqui o formulário */}
    </Layout>
  )
}
