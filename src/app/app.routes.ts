import { Routes } from '@angular/router';

import { CartaComponent } from './carta/carta.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  // Landing comercial.
  { path: '', pathMatch: 'full', component: LandingComponent, title: 'tumenuapp — Carta digital para restaurantes' },

  // Restaurantes de prueba. Va como ruta padre (y antes de ':restaurantId')
  // para que "ejemplos" no se tome como un restaurantId, y para que la
  // navegación relativa del selector se quede dentro de /ejemplos.
  {
    path: 'ejemplos',
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/' },
      { path: ':restaurantId', component: CartaComponent, title: 'Carta de ejemplo — tumenuapp', data: { esEjemplo: true } },
    ],
  },

  // Restaurantes reales: tumenuapp.com/mi-restaurante
  { path: ':restaurantId', component: CartaComponent, title: 'Carta — tumenuapp' },

  { path: '**', redirectTo: '' },
];
