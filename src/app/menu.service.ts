import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Menu, RestauranteResumen } from './menu.model';

// Por ahora fija; más adelante pasa a environment.ts.
const API_BASE_URL = 'https://a9n5chjhe4.execute-api.us-east-1.amazonaws.com';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);

  getMenu(restaurantId: string): Observable<Menu> {
    return this.http.get<Menu>(`${API_BASE_URL}/menu/${encodeURIComponent(restaurantId)}`);
  }

  getRestaurantes(): Observable<RestauranteResumen[]> {
    return this.http.get<RestauranteResumen[]>(`${API_BASE_URL}/restaurantes`);
  }
}
