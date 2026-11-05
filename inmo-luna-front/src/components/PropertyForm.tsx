import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type DragEvent,
  type SubmitEvent,
} from "react";
import type { Property, PropertyImage, PropertyInput } from "../types.d";
import { imageSrc } from "../config";

interface PropertyFormProps {
  show: boolean;
  onClose: () => void;
  onSave: (property: PropertyInput, files: File[], removedImageIds: number[]) => Promise<void>;
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
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function NewImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="relative group">
      <img src={url} alt={file.name} className="w-full h-24 object-cover rounded-lg" />
      <button
        type="button"
        onClick={onRemove}
        title="Quitar imagen"
        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100"
      >
        ×
      </button>
      <span className="absolute bottom-1 left-1 bg-secondary text-white text-[10px] font-semibold px-2 py-0.5 rounded">
        Nueva
      </span>
    </div>
  );
}

export function PropertyForm({ show, onClose, onSave, editingProperty }: PropertyFormProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      });
      setExistingImages(editingProperty.imagenes ?? []);
    } else {
      setFormData(emptyForm);
      setExistingImages([]);
    }

    setRemovedImageIds([]);
    setNewFiles([]);
  }, [show, editingProperty]);

  if (!show) return null;

  const addFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((file) => ACCEPTED_TYPES.includes(file.type));
    setNewFiles((prev) => [...prev, ...valid]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;
    setSaving(true);

    const property: PropertyInput = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      precio: Number(formData.precio),
      moneda: formData.moneda,
      habitaciones: Number(formData.habitaciones),
      banos: Number(formData.banos),
      m2: Number(formData.m2),
      ubicacion: formData.ubicacion,
      descripcion: formData.descripcion,
    };

    try {
      await onSave(property, newFiles, removedImageIds);
    } finally {
      setSaving(false);
    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>

                  {(existingImages.length > 0 || newFiles.length > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                      {existingImages.map((imagen) => (
                        <div key={imagen.id} className="relative group">
                          <img src={imageSrc(imagen.url)} alt="Imagen de la propiedad" className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imagen.id)}
                            title="Quitar imagen"
                            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {newFiles.map((file, index) => (
                        <NewImagePreview
                          key={`${file.name}-${file.lastModified}-${index}`}
                          file={file}
                          onRemove={() => removeNewFile(index)}
                        />
                      ))}
                    </div>
                  )}

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragging ? "border-secondary bg-secondary/5" : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">
                      Arrastrá imágenes acá o
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-secondary font-semibold hover:underline"
                    >
                      seleccioná archivos
                    </button>
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG o WEBP · hasta 5 MB cada una</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
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
