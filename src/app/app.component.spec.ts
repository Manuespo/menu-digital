import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
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
      productos: [{ id: 'p8', nombre: 'Agua mineral 500ml', descripcion: null, precio: 1800, imagen: null }],
    },
  ],
};

describe('AppComponent', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => http.verify());

  async function crearEn(url: string) {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await router.navigateByUrl(url);
    fixture.detectChanges();
    return fixture;
  }

  it('should redirect the empty path to restaurante-ejemplo', async () => {
    await crearEn('');
    expect(router.url).toBe('/menu/restaurante-ejemplo');
    http.expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
  });

  it('should show loading message until the API responds', async () => {
    const fixture = await crearEn('/menu/restaurante-ejemplo');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cargando menú...');

    http.expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('Cargando menú...');
  });

  it('should render restaurant name and categories from the API', async () => {
    const fixture = await crearEn('/menu/restaurante-ejemplo');
    http.expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Restaurante Ejemplo');
    expect(compiled.querySelectorAll('section.categoria').length).toBe(2);
    expect(compiled.querySelectorAll('li.item').length).toBe(2);
  });

  it('should fetch the new menu when the route param changes', async () => {
    const fixture = await crearEn('/menu/restaurante-ejemplo');
    http.expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo')).flush(MENU_MOCK);

    await router.navigateByUrl('/menu/restaurante-vegano-test');
    fixture.detectChanges();
    http
      .expectOne((req) => req.url.endsWith('/menu/restaurante-vegano-test'))
      .flush({ restaurantId: 'restaurante-vegano-test', nombre: 'Verde Vegano', categorias: [
        { id: 'bebidas', nombre: 'Bebidas', productos: [] },
      ] });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Verde Vegano');
    expect(compiled.querySelectorAll('li.item').length).toBe(0);
  });

  it('should show error message and keep the selector when the request fails', async () => {
    const fixture = await crearEn('/menu/no-existe');
    http
      .expectOne((req) => req.url.endsWith('/menu/no-existe'))
      .flush({ error: 'Restaurante no encontrado' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se pudo cargar el menú');
    expect(compiled.querySelector('section.categoria')).toBeNull();
    expect(compiled.querySelector('select')).not.toBeNull();
  });

  it('should format prices with thousands separator and decimals', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    expect(app.formatearPrecio(12800)).toBe('$12.800');
    expect(app.formatearPrecio(500)).toBe('$500');
    expect(app.formatearPrecio(0)).toBe('$0');
    expect(app.formatearPrecio(4500.5)).toBe('$4.500,50');
  });
});
