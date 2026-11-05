import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { AdminLogin } from "../components/AdminLogin";
import { PropertyForm } from "../components/PropertyForm";
import type { Property, PropertyInput } from "../types.d";
import { VITE_API_URL, VITE_TOKEN_KEY, imageSrc } from "../config";

function formatPrice(precio: number, moneda: string, tipo: string): string {
  const simbolo = moneda === "USD" ? "$" : moneda === "EUR" ? "€" : "$";
  const formatted = new Intl.NumberFormat("es-ES").format(precio);
  const suffix = tipo === "alquiler" ? "/mes" : "";
  return `${simbolo}${formatted}${suffix}`;
}

export function Admin() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(VITE_TOKEN_KEY));
  const [propiedades, setPropiedades] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetch(`${VITE_API_URL}/properties`)
      .then((res) => res.json())
      .then((data: Property[]) => setPropiedades(data))
      .catch((err) => console.error("Error cargando propiedades:", err));
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem(VITE_TOKEN_KEY, newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem(VITE_TOKEN_KEY);
    setEditingProperty(null);
    setShowForm(false);
  };

  const handleAuthError = (res: Response): boolean => {
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      alert("Tu sesión expiró. Iniciá sesión de nuevo.");
      return true;
    }
    return false;
  };

  const handleSaveProperty = async (
    property: PropertyInput,
    files: File[],
    removedImageIds: number[],
  ) => {
    if (!token) return;

    const isEditing = Boolean(editingProperty);
    const url = isEditing
      ? `${VITE_API_URL}/properties/${editingProperty!.id}`
      : `${VITE_API_URL}/properties`;
    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(property),
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("No se pudo guardar la propiedad");
        return;
      }

      let saved: Property = await res.json();

      for (const imageId of removedImageIds) {
        const deleted = await fetch(
          `${VITE_API_URL}/properties/${saved.id}/images/${imageId}`,
          { method: "DELETE", headers: authHeaders },
        );

        if (handleAuthError(deleted)) return;

        if (!deleted.ok) {
          alert("No se pudo eliminar una de las imágenes");
          return;
        }
      }

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("imagenes", file));

        const uploaded = await fetch(`${VITE_API_URL}/properties/${saved.id}/images`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        });

        if (handleAuthError(uploaded)) return;

        if (!uploaded.ok) {
          alert("La propiedad se guardó, pero falló la subida de imágenes");
          return;
        }

        saved = await uploaded.json();
      } else if (removedImageIds.length > 0) {
        const refreshed = await fetch(`${VITE_API_URL}/properties/${saved.id}`);
        if (refreshed.ok) {
          saved = await refreshed.json();
        }
      }

      setPropiedades((prev) =>
        isEditing ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]
      );
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
      const res = await fetch(`${VITE_API_URL}/properties/${property.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (handleAuthError(res)) return;

      if (!res.ok) {
        alert("No se pudo eliminar la propiedad");
        return;
      }

      setPropiedades((prev) => prev.filter((p) => p.id !== property.id));
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

  if (!token) {
    return (
      <div className="min-h-screen bg-light">
        <AdminLogin
          show={true}
          onClose={() => navigate("/")}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Barra superior */}
      <header className="bg-primary text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Luna Inmobiliaria" className="h-11 w-11 rounded bg-white p-1" />
              <div>
                <p className="font-serif text-xl font-semibold leading-tight">Panel de administración</p>
                <p className="text-xs text-white/70 uppercase tracking-wider">Luna Inmobiliaria</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-white/80 hover:text-secondary transition-colors text-sm font-medium"
              >
                Ver sitio
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">Propiedades</h1>
            <p className="text-gray-600 mt-1">
              {propiedades.length} {propiedades.length === 1 ? "propiedad cargada" : "propiedades cargadas"}
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Propiedad
          </button>
        </div>

        {propiedades.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">Todavía no hay propiedades cargadas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Propiedad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {propiedades.map((propiedad) => (
                    <tr key={propiedad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={propiedad.imagenes?.[0]?.url ? imageSrc(propiedad.imagenes[0].url) : "https://via.placeholder.com/120x90?text=Sin+foto"}
                            alt={propiedad.titulo}
                            className="w-20 h-14 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-primary">{propiedad.titulo}</p>
                            <p className="text-sm text-gray-500">
                              {propiedad.habitaciones} hab. · {propiedad.banos} baños · {propiedad.m2} m²
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${propiedad.tipo === "venta" ? "bg-primary/10 text-primary" : "bg-secondary/15 text-secondary"}`}>
                          {propiedad.tipo === "venta" ? "Venta" : "Alquiler"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-secondary">
                        {formatPrice(propiedad.precio, propiedad.moneda, propiedad.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{propiedad.ubicacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(propiedad)}
                            title="Editar"
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(propiedad)}
                            title="Eliminar"
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <PropertyForm
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
      />
    </div>
  );
}
