import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Shell de la app: cada ruta (landing, carta) se renderiza en el outlet.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {}
