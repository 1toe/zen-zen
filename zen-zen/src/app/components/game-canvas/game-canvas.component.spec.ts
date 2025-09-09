import { TestBed } from '@angular/core/testing';
import { GameCanvasComponent } from './game-canvas.component';
import { GameEngineService } from '../../services';
import { ZenIconService } from '../../services/zen-icon.service';

// Simple mocks (si se necesitan ampliar, mover a carpeta test-utils)
class GameEngineServiceMock extends GameEngineService {}

describe('GameCanvasComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCanvasComponent],
      providers: [
        { provide: GameEngineService, useClass: GameEngineServiceMock },
        ZenIconService
      ]
    }).compileComponents();
  });

  it('should create component', () => {
    const fixture = TestBed.createComponent(GameCanvasComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('should render two layered canvases', () => {
    const fixture = TestBed.createComponent(GameCanvasComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const canvases = el.querySelectorAll('canvas');
    expect(canvases.length).toBe(2);
  });
});
