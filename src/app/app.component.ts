import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs';

import { Menu } from './menu.model';
import { MenuService } from './menu.service';

export type Theme = 'clasico' | 'moderno' | 'elegante';

@Component({
  selector: 'app-root',
  imports: [NgFor, NgIf, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private menuService = inject(MenuService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Hardcodeados porque la API no tiene endpoint de listado todavía.
  restaurantes = [
    { id: 'restaurante-ejemplo', label: 'Restaurante Ejemplo' },
    { id: 'restaurante-parrilla-test', label: 'Parrilla (test)' },
    { id: 'restaurante-vegano-test', label: 'Vegano (test)' },
  ];

  restaurantId: string | null = null;

  // null mientras carga; si falla queda null y `error` en true.
  menu: Menu | null = null;
  error = false;

  activeTheme: Theme = 'clasico';

  ngOnInit(): void {
    // AppComponent está fuera del <router-outlet>, así que su ActivatedRoute es
    // la raíz: el :restaurantId vive en `firstChild`. Lo releemos en cada
    // navegación y solo pedimos el menú cuando el id cambia.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        startWith(null),
        map(() => this.route.firstChild?.snapshot.paramMap.get('restaurantId') ?? null),
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

  irARestaurante(id: string): void {
    this.router.navigate(['/menu', id]);
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
