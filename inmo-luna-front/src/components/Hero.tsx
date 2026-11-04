import { useState } from 'react';

interface HeroProps {
  onSearch: (filters: { tipo: string; habitaciones: string; precio: string }) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [tipo, setTipo] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  const [precio, setPrecio] = useState('');

  const handleSearch = () => {
    onSearch({ tipo, habitaciones, precio });
    document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative bg-primary text-white py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Encuentra tu hogar ideal
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
          Descubre nuestra selección exclusiva de propiedades en venta y alquiler
        </p>

        <div className="bg-white rounded-lg shadow-xl p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary text-dark"
            >
              <option value="" disabled>Tipo</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
            <select
              value={habitaciones}
              onChange={(e) => setHabitaciones(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary text-dark"
            >
              <option value="" disabled>Habitaciones</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            <select
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary text-dark"
            >
              <option value="" disabled>Precio</option>
              <option value="0-100000">Hasta $100,000</option>
              <option value="100000-250000">$100,000 - $250,000</option>
              <option value="250000-500000">$250,000 - $500,000</option>
              <option value="500000-999999999">$500,000+</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
