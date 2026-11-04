type PropertyType = 'venta' | 'alquiler';

export interface Property {
    id: number;
    titulo: string;
    tipo: PropertyType;
    precio: number;
    moneda: string;
    habitaciones: number;
    banos: number;
    m2: number;
    ubicacion: string;
    descripcion: string;
    fotos: string[];
}

export interface Filters {
    tipo: string;
    habitaciones: string;
    ubicacion: string;
    precio: string;
}
