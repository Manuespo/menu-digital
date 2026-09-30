// Forma exacta de la respuesta de GET /menu/{restaurantId}.

export interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
}

export interface MenuCategory {
  id: string;
  nombre: string;
  productos: MenuItem[];
}

export interface Menu {
  restaurantId: string;
  nombre: string;
  // Branding personalizable (todavía no se usa en la UI). null = sin valor.
  colorPrimario: string | null;
  logoUrl: string | null;
  fuente: string | null;
  categorias: MenuCategory[];
  tema?: string;
}

// Forma de cada elemento de GET /restaurantes.
export interface RestauranteResumen {
  restaurantId: string;
  nombre: string;
}
