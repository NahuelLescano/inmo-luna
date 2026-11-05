type PropertyType = "venta" | "alquiler";

export interface PropertyImage {
  id: number;
  url: string;
  orden: number;
}

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
  imagenes: PropertyImage[];
}

export type PropertyInput = Omit<Property, "id" | "imagenes">;

export interface Filters {
  tipo: string;
  habitaciones: string;
  ubicacion: string;
  precio: string;
}
