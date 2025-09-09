import { Injectable } from '@angular/core';
import { 
  Circle, 
  Zap, 
  Star, 
  Shield, 
  Target,
  Sparkles,
  Hexagon,
  Triangle,
  Square,
  CircleDot,
  Plus,
  X
} from 'lucide-angular';

/**
 * Servicio de iconos zen que combina SVGs custom con Lucide icons
 */
@Injectable({
  providedIn: 'root'
})
export class ZenIconService {
  
  // Mapeo de iconos Lucide para elementos del juego
  public readonly gameIcons = {
    // Player icons
    player: {
      primary: Circle,
      zen: CircleDot,
      energy: Target
    },
    
    // Obstacle icons
    obstacles: {
      circle: Circle,
      square: Square,
      triangle: Triangle,
      hexagon: Hexagon,
      danger: X
    },
    
    // PowerUp icons
    powerups: {
      energy: Zap,
      score: Star,
      shield: Shield,
      zen: Target,
      multiplier: Plus,
      sparkle: Sparkles
    },
    
    // Particle effects
    particles: {
      sparkle: Sparkles,
      dot: CircleDot,
      star: Star
    }
  };
  
  /**
   * Obtener icono Lucide por categoría y tipo
   */
  public getIcon(category: keyof typeof this.gameIcons, type: string): any {
    const categoryIcons = this.gameIcons[category];
    return (categoryIcons as any)[type] || Circle;
  }
  
  /**
   * Crear SVG string desde icono Lucide
   */
  public createSVGString(category: keyof typeof this.gameIcons, type: string, size = 24, color = 'currentColor'): string {
    const IconComponent = this.getIcon(category, type);
    
    // Templates específicos para cada tipo
    switch (category) {
      case 'player':
        return this.createPlayerSVG(size, color);
      case 'obstacles':
        return this.createObstacleSVG(type, size, color);
      case 'powerups':
        return this.createPowerUpSVG(type, size, color);
      case 'particles':
        return this.createParticleSVG(type, size, color);
      default:
        return this.createBasicSVG(size, color);
    }
  }
  
  /**
   * Crear SVG del jugador con efectos zen
   */
  private createPlayerSVG(size: number, color: string): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="playerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#A8E6CF;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#4ECDC4;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#2E8B7E;stop-opacity:0.3" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#playerGrad)" filter="url(#glow)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#4ECDC4" opacity="0.9"/>
        <text x="${size/2}" y="${size/2 + 2}" text-anchor="middle" font-size="${size/3}" fill="white">☯</text>
      </svg>
    `;
  }
  
  /**
   * Crear SVG de obstáculo
   */
  private createObstacleSVG(type: string, size: number, color: string): string {
    const center = size / 2;
    const radius = size / 2 - 2;
    
    let shape = '';
    
    switch (type) {
      case 'circle':
        shape = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${color}" stroke="#C44569" stroke-width="2"/>`;
        break;
      case 'square':
        shape = `<rect x="2" y="2" width="${size-4}" height="${size-4}" fill="${color}" stroke="#C44569" stroke-width="2"/>`;
        break;
      case 'triangle':
        shape = `<polygon points="${center},2 ${size-2},${size-2} 2,${size-2}" fill="${color}" stroke="#C44569" stroke-width="2"/>`;
        break;
      default:
        shape = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${color}"/>`;
    }
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        ${shape}
      </svg>
    `;
  }
  
  /**
   * Crear SVG de power-up
   */
  private createPowerUpSVG(type: string, size: number, color: string): string {
    const center = size / 2;
    const radius = size / 2 - 2;
    
    let symbol = '★';
    let gradientColor = '#4ECDC4';
    
    switch (type) {
      case 'energy':
        symbol = '⚡';
        gradientColor = '#4ECDC4';
        break;
      case 'score':
        symbol = '★';
        gradientColor = '#FFD93D';
        break;
      case 'shield':
        symbol = '🛡';
        gradientColor = '#6C5CE7';
        break;
      case 'zen':
        symbol = '☯';
        gradientColor = '#A8E6CF';
        break;
      case 'multiplier':
        symbol = '×';
        gradientColor = '#FF8B94';
        break;
    }
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="powerUpGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${gradientColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradientColor};stop-opacity:0.3" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#powerUpGrad)" filter="url(#glow)"/>
        <text x="${center}" y="${center + 2}" text-anchor="middle" font-size="${size/3}" fill="white">${symbol}</text>
      </svg>
    `;
  }
  
  /**
   * Crear SVG de partícula
   */
  private createParticleSVG(type: string, size: number, color: string): string {
    const center = size / 2;
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="particleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.2" />
          </radialGradient>
        </defs>
        <circle cx="${center}" cy="${center}" r="${size/4}" fill="url(#particleGrad)"/>
      </svg>
    `;
  }
  
  /**
   * Crear SVG básico
   */
  private createBasicSVG(size: number, color: string): string {
    const center = size / 2;
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${center}" cy="${center}" r="${size/3}" fill="${color}"/>
      </svg>
    `;
  }
  
  /**
   * Convertir SVG string a Image element
   */
  public async svgStringToImage(svgString: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to create image from SVG'));
      };
      
      img.src = url;
    });
  }
  
  /**
   * Obtener data URL de SVG
   */
  public svgToDataURL(svgString: string): string {
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  }
}
