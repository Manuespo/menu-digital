import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Menu } from './menu.model';

// Por ahora fija; más adelante pasa a environment.ts.
const MENU_API_URL = 'https://a9n5chjhe4.execute-api.us-east-1.amazonaws.com/menu/restaurante-ejemplo';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);

  getMenu(): Observable<Menu> {
    return this.http.get<Menu>(MENU_API_URL);
  }
}
