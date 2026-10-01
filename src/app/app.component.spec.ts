import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('Rutas de la app', () => {
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

  async function navegar(url: string) {
    const fixture = TestBed.createComponent(AppComponent);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  // Igual que `navegar`, pero devuelve el fixture: hace falta para poder llamar
  // detectChanges() de nuevo después de flushear la respuesta del menú.
  async function navegarConFixture(url: string) {
    const fixture = TestBed.createComponent(AppComponent);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    return fixture;
  }

  // Requests que hace la carta al iniciar. En /ejemplos también pide el
  // listado para el selector; en una ruta real no lo pide, porque el
  // selector queda oculto fuera de /ejemplos.
  function esperarCartaEjemplo(restaurantId: string) {
    http.expectOne((req) => req.url.endsWith('/restaurantes')).flush([]);
    http.expectOne((req) => req.url.endsWith(`/menu/${restaurantId}`));
  }

  function esperarCartaReal(restaurantId: string) {
    http.expectOne((req) => req.url.endsWith(`/menu/${restaurantId}`));
  }

  it('should show the landing at "/" without calling the API', async () => {
    const compiled = await navegar('/');
    expect(compiled.querySelector('app-landing')).not.toBeNull();
    expect(compiled.querySelector('app-carta')).toBeNull();
    expect(compiled.querySelector('h1')?.textContent).toContain('Carta digital siempre actualizada');
  });

  it('should show the carta for a test restaurant under /ejemplos/:restaurantId', async () => {
    const compiled = await navegar('/ejemplos/restaurante-parrilla-test');
    expect(compiled.querySelector('app-carta')).not.toBeNull();
    expect(router.url).toBe('/ejemplos/restaurante-parrilla-test');
    esperarCartaEjemplo('restaurante-parrilla-test');
  });

  it('should show the carta for a real restaurant under /:restaurantId', async () => {
    const compiled = await navegar('/mi-restaurante');
    expect(compiled.querySelector('app-carta')).not.toBeNull();
    expect(router.url).toBe('/mi-restaurante');
    esperarCartaReal('mi-restaurante');
  });

  it('should hide the restaurant selector and theme switcher outside /ejemplos', async () => {
    const compiled = await navegar('/mi-restaurante');
    esperarCartaReal('mi-restaurante');
    expect(compiled.querySelector('select')).toBeNull();
    expect(compiled.querySelector('.theme-switcher')).toBeNull();
  });

  it('should show the "volver" link and hide the "powered by" credit under /ejemplos', async () => {
    const fixture = await navegarConFixture('/ejemplos/restaurante-ejemplo');
    http.expectOne((req) => req.url.endsWith('/restaurantes')).flush([]);
    http
      .expectOne((req) => req.url.endsWith('/menu/restaurante-ejemplo'))
      .flush({ restaurantId: 'restaurante-ejemplo', nombre: 'Restaurante Ejemplo', categorias: [] });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.volver-landing')).not.toBeNull();
    expect(compiled.querySelector('.creditos')).toBeNull();
  });

  it('should hide the "volver" link and show the "powered by" credit for a real restaurant', async () => {
    const fixture = await navegarConFixture('/mi-restaurante');
    http
      .expectOne((req) => req.url.endsWith('/menu/mi-restaurante'))
      .flush({ restaurantId: 'mi-restaurante', nombre: 'Mi Restaurante', categorias: [] });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.volver-landing')).toBeNull();
    expect(compiled.querySelector('.creditos')).not.toBeNull();
    expect(compiled.querySelector('.creditos')?.textContent).toContain('Hecho con tumenuapp');
  });

  it('should redirect /ejemplos (without id) to the landing', async () => {
    await navegar('/ejemplos');
    expect(router.url).toBe('/');
  });

  it('should redirect unknown routes to the landing', async () => {
    const compiled = await navegar('/menu/restaurante-ejemplo');
    expect(router.url).toBe('/');
    expect(compiled.querySelector('app-landing')).not.toBeNull();
  });
});
