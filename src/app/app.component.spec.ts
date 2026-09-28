import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { Menu, RestauranteResumen } from './menu.model';

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

const RESTAURANTES_MOCK: RestauranteResumen[] = [
  { restaurantId: 'restaurante-ejemplo', nombre: 'Restaurante Ejemplo' },
  { restaurantId: 'restaurante-parrilla-test', nombre: 'La Parrilla de Prueba' },
  { restaurantId: 'restaurante-vegano-test', nombre: 'Verde Vegano (Test)' },
];

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

  // Crea el componente, navega a `url` y responde GET /restaurantes
  // (con RESTAURANTES_MOCK, o con error 500 si `listadoFalla`).
  async function crearEn(url: string, { listadoFalla = false } = {}) {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const listado = http.expectOne((req) => req.url.endsWith('/restaurantes'));
    if (listadoFalla) {
      listado.flush('error', { status: 500, statusText: 'Server Error' });
    } else {
      listado.flush(RESTAURANTES_MOCK);
    }
    await router.navigateByUrl(url);
    fixture.detectChanges();
    return fixture;
  }

  function opcionesDelSelect(fixture: { nativeElement: HTMLElement }): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('select option')).map(
      (o) => (o as HTMLOptionElement).value
    );
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

  it('should populate the selector from GET /restaurantes and mark the current one', async () => {
    const fixture = await crearEn('/menu/restaurante-parrilla-test');
    http.expectOne((req) => req.url.endsWith('/menu/restaurante-parrilla-test')).flush({
      restaurantId: 'restaurante-parrilla-test', nombre: 'La Parrilla de Prueba', categorias: [],
    });
    fixture.detectChanges();

    expect(opcionesDelSelect(fixture)).toEqual([
      'restaurante-ejemplo', 'restaurante-parrilla-test', 'restaurante-vegano-test',
    ]);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('restaurante-parrilla-test');
  });

  it('should navigate when a restaurant is picked in the selector', async () => {
    const fixture = await crearEn('/menu/restaurante-ejemplo');
    http.expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
    fixture.detectChanges();

    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'restaurante-vegano-test';
    select.dispatchEvent(new Event('change'));
    expect(navigate).toHaveBeenCalledWith(['/menu', 'restaurante-vegano-test']);
  });

  it('should keep the page working with only the current restaurant if the list fails', async () => {
    const fixture = await crearEn('/menu/restaurante-ejemplo', { listadoFalla: true });
    expect(opcionesDelSelect(fixture)).toEqual([]);

    http.expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo')).flush(MENU_MOCK);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Restaurante Ejemplo');
    expect(compiled.querySelectorAll('section.categoria').length).toBe(2);
    expect(opcionesDelSelect(fixture)).toEqual(['restaurante-ejemplo']);
  });

  it('should format prices with thousands separator and decimals', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    expect(app.formatearPrecio(12800)).toBe('$12.800');
    expect(app.formatearPrecio(500)).toBe('$500');
    expect(app.formatearPrecio(0)).toBe('$0');
    expect(app.formatearPrecio(4500.5)).toBe('$4.500,50');
  });
});
