import type { Property } from "../types.d";
import { imageSrc } from "../config";

interface PropertyModalProps {
    property: Property | null;
    onClose: () => void;
}

function formatPrice(precio: number, moneda: string, tipo: string): string {
    const simbolo = moneda === "USD" ? "$" : moneda === "EUR" ? "€" : "$";
    const formatted = new Intl.NumberFormat("es-ES").format(precio);
    const suffix = tipo === "alquiler" ? "/mes" : "";
    return `${simbolo}${formatted}${suffix}`;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
    if (!property) return null;

    const mensaje = `Hola, me interesa la propiedad "${property.titulo}" en ${property.ubicacion}. ¿Podrían darme más información?`;
    const telefono = "1234567890";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-4xl sm:w-full">
                    <div className="bg-white">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-serif text-2xl font-semibold text-primary">{property.titulo}</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {property.imagenes && property.imagenes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {property.imagenes.map((imagen, index) => (
                                        <img
                                            key={imagen.id}
                                            src={imageSrc(imagen.url)}
                                            alt={`${property.titulo} - Foto ${index + 1}`}
                                            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(imageSrc(imagen.url), "_blank")}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8 mb-6">No hay fotos disponibles</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Descripción</h4>
                                    <p className="text-gray-600">{property.descripcion}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Características</h4>
                                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-gray-600">
                                        <dt className="text-gray-500 whitespace-nowrap">Precio:</dt>
                                        <dd className="font-semibold text-secondary">
                                            {formatPrice(property.precio, property.moneda, property.tipo)}
                                        </dd>

                                        <dt className="text-gray-500 whitespace-nowrap">Habitaciones:</dt>
                                        <dd>{property.habitaciones}</dd>

                                        <dt className="text-gray-500 whitespace-nowrap">Baños:</dt>
                                        <dd>{property.banos}</dd>

                                        <dt className="text-gray-500 whitespace-nowrap">Superficie:</dt>
                                        <dd>{property.m2} m²</dd>

                                        <dt className="text-gray-500 whitespace-nowrap">Ubicación:</dt>
                                        <dd>{property.ubicacion}</dd>

                                        <dt className="text-gray-500 whitespace-nowrap">Tipo:</dt>
                                        <dd className="capitalize">{property.tipo}</dd>
                                    </dl>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <a
                                    href={`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                                >
                                    Contactar por WhatsApp
                                </a>
                                <a
                                    href={`mailto:info@lunainmobiliaria.com?subject=Consulta: ${encodeURIComponent(property.titulo)}&body=${encodeURIComponent(mensaje)}`}
                                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                                >
                                    Enviar Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
