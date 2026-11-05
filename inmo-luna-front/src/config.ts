export const {
  VITE_API_URL = "http://localhost:3001/api",
  VITE_TOKEN_KEY,
} = import.meta.env;

// Origen del backend a partir de la URL de la API.
// En Docker VITE_API_URL="/api" (mismo origen) y las imágenes quedan relativas.
const API_ORIGIN = /^https?:\/\//.test(VITE_API_URL)
  ? new URL(VITE_API_URL).origin
  : "";

export function imageSrc(url: string): string {
  if (!url || /^https?:\/\//.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}
