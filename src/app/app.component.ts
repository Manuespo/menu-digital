import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';

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

  // null mientras carga; si falla queda null y `error` en true.
  menu: Menu | null = null;
  error = false;

  activeTheme: Theme = 'clasico';

  ngOnInit(): void {
    this.menuService
      .getMenu()
      .pipe(
        catchError((err) => {
          console.error('Error al cargar el menú', err);
          this.error = true;
          return EMPTY;
        })
      )
      .subscribe((menu) => (this.menu = menu));
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

  // Formato fijo "$12.800" (separador de miles con punto), sin depender de LOCALE_ID.
  formatearPrecio(precio: number): string {
    return '$' + precio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
