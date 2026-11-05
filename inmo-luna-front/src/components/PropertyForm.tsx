import { useState, useEffect, type SubmitEvent } from "react";
import type { Property } from "../types.d";

interface PropertyFormProps {
  show: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, "id">) => void;
  editingProperty?: Property | null;
}

const emptyForm = {
  titulo: "",
  tipo: "venta" as "venta" | "alquiler",
  precio: "",
  moneda: "USD",
  habitaciones: "",
  banos: "",
  m2: "",
  ubicacion: "",
  descripcion: "",
  fotos: ""
};

export function PropertyForm({ show, onClose, onSave, editingProperty }: PropertyFormProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(editingProperty);

  useEffect(() => {
    if (!show) return;

    if (editingProperty) {
      setFormData({
        titulo: editingProperty.titulo,
        tipo: editingProperty.tipo,
        precio: String(editingProperty.precio),
        moneda: editingProperty.moneda,
        habitaciones: String(editingProperty.habitaciones),
        banos: String(editingProperty.banos),
        m2: String(editingProperty.m2),
        ubicacion: editingProperty.ubicacion,
        descripcion: editingProperty.descripcion,
        fotos: editingProperty.fotos.join("\n")
      });
    } else {
      setFormData(emptyForm);
    }
  }, [show, editingProperty]);

  if (!show) return null;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const property: Omit<Property, "id"> = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      precio: Number(formData.precio),
      moneda: formData.moneda,
      habitaciones: Number(formData.habitaciones),
      banos: Number(formData.banos),
      m2: Number(formData.m2),
      ubicacion: formData.ubicacion,
      descripcion: formData.descripcion,
      fotos: formData.fotos.split("\n").map(url => url.trim()).filter(url => url !== "")
    };

    onSave(property);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full">
          <div className="bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-serif text-2xl font-semibold text-primary">
                {isEditing ? "Editar Propiedad" : "Agregar Propiedad"}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="Casa Moderna en el Centro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as "venta" | "alquiler" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                  >
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={formData.moneda}
                    onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="Centro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.habitaciones}
                    onChange={(e) => setFormData({ ...formData, habitaciones: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.banos}
                    onChange={(e) => setFormData({ ...formData, banos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.m2}
                    onChange={(e) => setFormData({ ...formData, m2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="180"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="Descripción detallada de la propiedad..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URLs de Fotos (una por línea)</label>
                  <textarea
                    rows={3}
                    value={formData.fotos}
                    onChange={(e) => setFormData({ ...formData, fotos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="https://ejemplo.com/foto1.jpg&#10;https://ejemplo.com/foto2.jpg"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar Propiedad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}