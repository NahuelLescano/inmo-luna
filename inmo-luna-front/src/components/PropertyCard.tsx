import type { Property } from '../types.d';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatPrice(precio: number, moneda: string, tipo: string): string {
  const simbolo = moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : '$';
  const formatted = new Intl.NumberFormat('es-ES').format(precio);
  const suffix = tipo === 'alquiler' ? '/mes' : '';
  return `${simbolo}${formatted}${suffix}`;
}

export function PropertyCard({ property, onClick, isAdmin, onEdit, onDelete }: PropertyCardProps) {
  const fotoPrincipal = property.fotos && property.fotos.length > 0
    ? property.fotos[0]
    : 'https://via.placeholder.com/400x300?text=Sin+foto';

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative">
        <img src={fotoPrincipal} alt={property.titulo} className="w-full h-48 object-cover" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${property.tipo === 'venta' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
            {property.tipo === 'venta' ? 'Venta' : 'Alquiler'}
          </span>
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              title="Editar"
              className="bg-white/90 hover:bg-white text-primary p-2 rounded-full shadow transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              title="Eliminar"
              className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-primary mb-2">{property.titulo}</h3>
        <p className="text-gray-600 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.ubicacion}
        </p>
        <div className="flex items-center justify-between text-gray-600 mb-4">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.habitaciones} hab.
          </span>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2" />
            </svg>
            {property.banos} baños
          </span>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2" />
            </svg>
            {property.m2} m²
          </span>
        </div>
        <div className="text-2xl font-bold text-secondary">
          {formatPrice(property.precio, property.moneda, property.tipo)}
        </div>
      </div>
    </div>
  );
}