import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Luna Inmobiliaria" className="h-12 w-12" />
            <div className="flex flex-col">
              <span className="ml-3 font-serif text-2xl font-semibold text-primary tracking-wide">Luna Inmobiliaria</span>
              <span className="ml-3 text-xs font-medium text-secondary/80 tracking-wider uppercase">
                Matrícula N° 495
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-dark hover:text-secondary transition-colors">Inicio</a>
            <a href="#propiedades" className="text-dark hover:text-secondary transition-colors">Propiedades</a>
            <a href="#contacto" className="text-dark hover:text-secondary transition-colors">Contacto</a>
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <a href="#inicio" className="block py-2 text-dark hover:text-secondary">Inicio</a>
            <a href="#propiedades" className="block py-2 text-dark hover:text-secondary">Propiedades</a>
            <a href="#contacto" className="block py-2 text-dark hover:text-secondary">Contacto</a>
          </div>
        </div>
      )}
    </header>
  );
}