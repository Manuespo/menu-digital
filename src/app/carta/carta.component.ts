import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, filter, map, of, switchMap, tap } from 'rxjs';

import { Menu, RestauranteResumen } from '../menu.model';
import { MenuService } from '../menu.service';

export type Theme = 'clasico' | 'moderno' | 'elegante';

// Carta de un restaurante. Se usa en dos rutas: /ejemplos/:restaurantId
// (restaurantes de prueba) y /:restaurantId (restaurantes reales).
@Component({
  selector: 'app-carta',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.css'
})
export class CartaComponent implements OnInit {
  private menuService = inject(MenuService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Listado para el <select>; queda vacío si GET /restaurantes falla.
  restaurantes: RestauranteResumen[] = [];

  restaurantId: string | null = null;

  // true solo en /ejemplos/:restaurantId; controla si se muestran el selector
  // de restaurantes y el switcher de temas (ver carta.component.html).
  readonly esEjemplo = this.route.snapshot.data['esEjemplo'] === true;

  // null mientras carga; si falla queda null y `error` en true.
  menu: Menu | null = null;
  error = false;

  // URLs de imágenes que dieron error al cargar: se dejan de renderizar y la
  // tarjeta queda como un producto sin foto.
  imagenesFallidas = new Set<string>();

  activeTheme: Theme = 'clasico';

  // Si el listado no llegó, el <select> muestra al menos el restaurante cargado.
  get opcionesRestaurante(): RestauranteResumen[] {
    if (this.restaurantes.length) return this.restaurantes;
    return this.menu ? [{ restaurantId: this.menu.restaurantId, nombre: this.menu.nombre }] : [];
  }

  porRestaurantId(_: number, r: RestauranteResumen): string {
    return r.restaurantId;
  }

  ngOnInit(): void {
    if (this.esEjemplo) {
      this.menuService
        .getRestaurantes()
        .pipe(
          catchError((err) => {
            console.error('Error al cargar el listado de restaurantes', err);
            return of([]);
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((restaurantes) => (this.restaurantes = restaurantes));
    }

    // paramMap emite de nuevo si se navega a otro restaurante dentro de la misma
    // ruta (el componente se reutiliza); solo pedimos el menú cuando el id cambia.
    this.route.paramMap
      .pipe(
        map((params) => params.get('restaurantId')),
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        tap((id) => {
          this.restaurantId = id;
          this.menu = null;
          this.error = false;
        }),
        // switchMap cancela la request anterior si se cambia de restaurante antes de que responda.
        switchMap((id) =>
          this.menuService.getMenu(id).pipe(
            catchError((err) => {
              console.error('Error al cargar el menú', err);
              this.error = true;
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((menu) => (this.menu = menu));
  }

  // Navegación relativa: desde /ejemplos/x va a /ejemplos/y, desde /x va a /y.
  irARestaurante(id: string): void {
    this.router.navigate(['..', id], { relativeTo: this.route });
  }

  // ============================================================================
  // ⚠️  SELECTOR DE TEMAS TEMPORAL — SOLO PARA DESARROLLO  ⚠️
  //
  // `temas` y `setTheme()` existen únicamente para previsualizar y comparar los
  // 3 temas mientras desarrollamos. NO son parte del producto final.
  // Más adelante se reemplazan por lógica que lee el tema elegido desde una API
  // y asigna `activeTheme` una sola vez; en ese momento se borran esto y el
  // bloque `.theme-switcher` del template y del CSS.
  // ============================================================================
  temas: { id: Theme; label: string }[] = [
    { id: 'clasico', label: 'Clásico' },
    { id: 'moderno', label: 'Moderno' },
    { id: 'elegante', label: 'Elegante' },
  ];

  setTheme(theme: Theme): void {
    this.activeTheme = theme;
  }

  // Formato fijo "$12.800" / "$4.500,50" (miles con punto, decimales con coma solo
  // si los hay), sin depender de LOCALE_ID.
  formatearPrecio(precio: number): string {
    const [entero, decimales] = precio.toFixed(2).split('.');
    const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + miles + (decimales === '00' ? '' : ',' + decimales);
  }
}
