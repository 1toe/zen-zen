// Archivo de pruebas minimizado a petición: "saltate los tests".
// Mantenemos un único smoke test opcional. Comentar/Descomentar según necesidad.
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent (smoke only)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();
  });

  it('smoke: crea la app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  
  // Nota: Se omiten tests de DOM, señales y canvas intencionalmente.
});
