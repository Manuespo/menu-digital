export interface MenuItem {
  nombre: string;
  descripcion?: string;
  precio: number;
}

export interface MenuCategory {
  nombre: string;
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    nombre: 'Entradas',
    items: [
      {
        nombre: 'Provoleta a la parrilla',
        descripcion: 'Queso provolone grillado con orégano y aceite de oliva',
        precio: 5500,
      },
      {
        nombre: 'Empanadas de carne (x2)',
        descripcion: 'Corte cuchillo, cebolla y especias criollas',
        precio: 3200,
      },
    ],
  },
  {
    nombre: 'Platos principales',
    items: [
      {
        nombre: 'Bife de chorizo',
        descripcion: '300g, con papas rústicas y ensalada mixta',
        precio: 12800,
      },
      {
        nombre: 'Ñoquis de papa caseros',
        descripcion: 'Salsa a elección: fileto, cuatro quesos o pesto',
        precio: 8900,
      },
      {
        nombre: 'Milanesa napolitana',
        descripcion: 'Con papas fritas o puré, jamón y muzzarella gratinada',
        precio: 10500,
      },
    ],
  },
  {
    nombre: 'Postres',
    items: [
      { nombre: 'Flan casero', descripcion: 'Con dulce de leche y crema', precio: 3800 },
      { nombre: 'Tiramisú', descripcion: 'Receta tradicional italiana', precio: 4500 },
    ],
  },
  {
    nombre: 'Bebidas',
    items: [
      { nombre: 'Agua mineral 500ml', precio: 1800 },
      { nombre: 'Gaseosa línea Coca-Cola', precio: 2200 },
      { nombre: 'Copa de vino de la casa', precio: 3500 },
    ],
  },
];
