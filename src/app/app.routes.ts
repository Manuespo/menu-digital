import { Routes } from '@angular/router';

// El menú lo renderiza AppComponent (lee :restaurantId desde ActivatedRoute),
// así que estas rutas no cargan un componente propio: `children: []` las hace
// válidas sin componente.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'menu/restaurante-ejemplo' },
  { path: 'menu/:restaurantId', children: [] },
  { path: '**', redirectTo: 'menu/restaurante-ejemplo' },
];
