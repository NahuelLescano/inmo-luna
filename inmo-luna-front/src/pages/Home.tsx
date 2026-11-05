import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyModal } from "../components/PropertyModal";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import type { Property } from "../types.d";
import { VITE_API_URL } from "../config";

export function Home() {
  const [propiedades, setPropiedades] = useState<Property[]>([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState<Property[]>([]);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Property | null>(null);
  const [ubicaciones, setUbicaciones] = useState<string[]>([]);
  const [filtros, setFiltros] = useState({
    tipo: "",
    habitaciones: "",
    ubicacion: "",
  });

  useEffect(() => {
    fetch(`${VITE_API_URL}/properties`)
      .then((res) => res.json())
      .then((data: Property[]) => {
        setPropiedades(data);
        setPropiedadesFiltradas(data);
        const unicas = [...new Set(data.map((p) => p.ubicacion))].sort();
        setUbicaciones(unicas);
      })
      .catch((err) => console.error("Error cargando propiedades:", err));
  }, []);

  const handleSearch = ({ tipo, habitaciones, precio }: { tipo: string; habitaciones: string; precio: string }) => {
    let filtradas = [...propiedades];

    if (tipo) {
      filtradas = filtradas.filter((p) => p.tipo === tipo);
    }
    if (habitaciones) {
      filtradas = filtradas.filter((p) => p.habitaciones >= parseInt(habitaciones));
    }
    if (precio) {
      const [min, max] = precio.split("-").map(Number);
      filtradas = filtradas.filter((p) => p.precio >= min && p.precio <= max);
    }

    setPropiedadesFiltradas(filtradas);
  };

  const handleFilter = () => {
    let filtradas = [...propiedades];

    if (filtros.tipo) {
      filtradas = filtradas.filter((p) => p.tipo === filtros.tipo);
    }
    if (filtros.habitaciones) {
      filtradas = filtradas.filter((p) => p.habitaciones >= parseInt(filtros.habitaciones));
    }
    if (filtros.ubicacion) {
      filtradas = filtradas.filter((p) => p.ubicacion === filtros.ubicacion);
    }

    setPropiedadesFiltradas(filtradas);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero onSearch={handleSearch} />

      <section id="propiedades" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              Todas las Propiedades
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora nuestro catálogo completo
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-light rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              >
                <option value="">Tipo</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
              <select
                value={filtros.habitaciones}
                onChange={(e) => setFiltros({ ...filtros, habitaciones: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              >
                <option value="">Habitaciones</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <select
                value={filtros.ubicacion}
                onChange={(e) => setFiltros({ ...filtros, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
              >
                <option value="">Ubicación</option>
                {ubicaciones.map((ubicacion) => (
                  <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                ))}
              </select>
              <button
                onClick={handleFilter}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>

          {propiedadesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron propiedades con esos criterios</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {propiedadesFiltradas.map((propiedad) => (
                <PropertyCard
                  key={propiedad.id}
                  property={propiedad}
                  onClick={() => setPropiedadSeleccionada(propiedad)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Contact />
      <Footer />

      <PropertyModal
        property={propiedadSeleccionada}
        onClose={() => setPropiedadSeleccionada(null)}
      />
    </div>
  );
}
