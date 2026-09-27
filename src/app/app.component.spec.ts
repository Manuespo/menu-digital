import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { Menu } from './menu.model';

const MENU_MOCK: Menu = {
  restaurantId: 'restaurante-ejemplo',
  nombre: 'Restaurante Ejemplo',
  tema: 'clasico',
  categorias: [
    {
      id: 'entradas',
      nombre: 'Entradas',
      productos: [
        { id: 'p1', nombre: 'Provoleta a la parrilla', descripcion: 'Queso grillado.', precio: 5500, imagen: null },
      ],
    },
    {
      id: 'bebidas',
      nombre: 'Bebidas',
      productos: [{ id: 'p8', nombre: 'Agua mineral 500ml', descripcion: '', precio: 1800, imagen: null }],
    },
  ],
};

describe('AppComponent', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should show loading message until the API responds', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cargando menú...');

    http.expectOne((req) => req.url.includes('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('Cargando menú...');
  });

  it('should render restaurant name and categories from the API', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    http.expectOne((req) => req.url.includes('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Restaurante Ejemplo');
    expect(compiled.querySelectorAll('section.categoria').length).toBe(2);
    expect(compiled.querySelectorAll('li.item').length).toBe(2);
  });

  it('should show error message when the request fails', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    http
      .expectOne((req) => req.url.includes('/menu/restaurante-ejemplo'))
      .flush('error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se pudo cargar el menú');
    expect(compiled.querySelector('section.categoria')).toBeNull();
  });

  it('should format prices with thousands separator', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    expect(app.formatearPrecio(12800)).toBe('$12.800');
    expect(app.formatearPrecio(500)).toBe('$500');
  });
});
