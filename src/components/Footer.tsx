// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-auto">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} Barber’s Agenda. Todos os direitos reservados.
      </div>
    </footer>
  )
}
