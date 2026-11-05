import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyModal } from "./components/PropertyModal";
import { PropertyForm } from "./components/PropertyForm";
import { AdminLogin } from "./components/AdminLogin";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import type { Property } from "./types.d";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const TOKEN_KEY = "luna_admin_token";

export function App() {
  const [propiedades, setPropiedades] = useState<Property[]>([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState<Property[]>([]);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [ubicaciones, setUbicaciones] = useState<string[]>([]);
  const [filtros, setFiltros] = useState({
    tipo: "",
    habitaciones: "",
    ubicacion: ""
  });

  const isAdmin = Boolean(token);

  const updateUbicaciones = (list: Property[]) => {
    const unicas = [...new Set(list.map(p => p.ubicacion))].sort();
    setUbicaciones(unicas);
  };

  useEffect(() => {
    fetch(`${API_URL}/properties`)
      .then(res => res.json())
      .then(data => {
        setPropiedades(data);
        setPropiedadesFiltradas(data);
        updateUbicaciones(data);
      })
      .catch(err => console.error("Error cargando propiedades:", err));
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    setEditingProperty(null);
    setShowForm(false);
  };

  const handleAuthError = (res: Response): boolean => {
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      alert("Tu sesión expiró. Iniciá sesión de nuevo.");
      setShowLogin(true);
      return true;
    }
    return false;
  };

  const handleSearch = ({ tipo, habitaciones, precio }: { tipo: string; habitaciones: string; precio: string }) => {
    let filtradas = [...propiedades];

    if (tipo) {
      filtradas = filtradas.filter(p => p.tipo === tipo);
    }
    if (habitaciones) {
      filtradas = filtradas.filter(p => p.habitaciones >= parseInt(habitaciones));
    }
    if (precio) {
      const [min, max] = precio.split("-").map(Number);
      filtradas = filtradas.filter(p => p.precio >= min && p.precio <= max);
    }

    setPropiedadesFiltradas(filtradas);
  };

  const handleFilter = () => {
    let filtradas = [...propiedades];

    if (filtros.tipo) {
      filtradas = filtradas.filter(p => p.tipo === filtros.tipo);
    }
    if (filtros.habitaciones) {
      filtradas = filtradas.filter(p => p.habitaciones >= parseInt(filtros.habitaciones));
    }
    if (filtros.ubicacion) {
      filtradas = filtradas.filter(p => p.ubicacion === filtros.ubicacion);
    }

    setPropiedadesFiltradas(filtradas);
  };

  const handleSaveProperty = async (property: Omit<Property, "id">) => {
    if (!token) {
      setShowLogin(true);
      return;
    }

    const isEditing = Boolean(editingProperty);
    const url = isEditing
      ? `${API_URL}/properties/${editingProperty!.id}`
      : `${API_URL}/properties`;

    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(property)
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("No se pudo guardar la propiedad");
        return;
      }

      const saved: Property = await res.json();

      const updated = isEditing
        ? propiedades.map(p => (p.id === saved.id ? saved : p))
        : [...propiedades, saved];

      setPropiedades(updated);
      setPropiedadesFiltradas(prev =>
        isEditing ? prev.map(p => (p.id === saved.id ? saved : p)) : [...prev, saved]
      );
      updateUbicaciones(updated);

      if (propiedadSeleccionada?.id === saved.id) {
        setPropiedadSeleccionada(saved);
      }

      setShowForm(false);
      setEditingProperty(null);
      alert(isEditing ? "Propiedad actualizada exitosamente" : "Propiedad creada exitosamente");
    } catch (err) {
      console.error("Error guardando propiedad:", err);
      alert("Error al guardar la propiedad");
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    if (!token) return;
    if (!confirm(`¿Eliminar "${property.titulo}"? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/properties/${property.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("No se pudo eliminar la propiedad");
        return;
      }

      const updated = propiedades.filter(p => p.id !== property.id);
      setPropiedades(updated);
      setPropiedadesFiltradas(prev => prev.filter(p => p.id !== property.id));
      updateUbicaciones(updated);

      if (propiedadSeleccionada?.id === property.id) {
        setPropiedadSeleccionada(null);
      }

      alert("Propiedad eliminada");
    } catch (err) {
      console.error("Error eliminando propiedad:", err);
      alert("Error al eliminar la propiedad");
    }
  };

  const openCreateForm = () => {
    setEditingProperty(null);
    setShowForm(true);
  };

  const openEditForm = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        isAdmin={isAdmin}
        onAdminClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      <Hero onSearch={handleSearch} />

      {/* Todas las Propiedades */}
      <section id="propiedades" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2">
                Todas las Propiedades
              </h2>
              <p className="text-gray-600">
                Explora nuestro catálogo completo
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={openCreateForm}
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Propiedad
              </button>
            )}
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
                {ubicaciones.map(ubicacion => (
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
              {propiedadesFiltradas.map(propiedad => (
                <PropertyCard
                  key={propiedad.id}
                  property={propiedad}
                  onClick={() => setPropiedadSeleccionada(propiedad)}
                  isAdmin={isAdmin}
                  onEdit={() => openEditForm(propiedad)}
                  onDelete={() => handleDeleteProperty(propiedad)}
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

      <PropertyForm
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
      />

      <AdminLogin
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}