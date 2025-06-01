import sharp from 'sharp';
import { consola } from 'consola';
import type { TextVariation, CanvasConfig } from './types';

export class ImageGenerator {
  async generateFlyer(
    textVariation: TextVariation,
    canvasConfig: CanvasConfig,
    outputPath: string
  ): Promise<void> {
    consola.info(`🎨 Generating image: ${outputPath}`);

    try {
      // Create the flyer SVG
      const svg = this.createSVG(textVariation, canvasConfig);

      // Convert SVG to PNG using Sharp
      await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outputPath);

      consola.success(`✅ Image generated: ${outputPath}`);
    } catch (error) {
      consola.error(`❌ Error generating image ${outputPath}:`, error);
      throw error;
    }
  }

  private createSVG(text: TextVariation, config: CanvasConfig): string {
    const { width, height, backgroundColor, textColor, accentColor } = config;

    // Calculate responsive text sizes
    const titleSize = Math.max(24, width * 0.05);
    const subtitleSize = Math.max(18, width * 0.035);
    const descriptionSize = Math.max(14, width * 0.025);
    const ctaSize = Math.max(16, width * 0.03);

    // Dynamic positions
    const centerX = width / 2;
    const titleY = height * 0.25;
    const subtitleY = titleY + titleSize + 20;
    const descriptionY = height * 0.55;
    const ctaY = height * 0.8;

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(
        backgroundColor,
        0.2
      )};stop-opacity:1" />
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>

  <!-- Background with gradient -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>

  <!-- Geometric decoration -->
  <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.08}"
          fill="${accentColor}" opacity="0.3"/>
  <rect x="${width * 0.05}" y="${height * 0.85}" width="${
      width * 0.15
    }" height="${height * 0.1}"
        fill="${accentColor}" opacity="0.3" rx="5"/>

  <!-- Main title -->
  <text x="${centerX}" y="${titleY}"
        font-family="Arial, sans-serif"
        font-size="${titleSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
        filter="url(#shadow)">
    ${this.escapeXML(text.title)}
  </text>

  <!-- Subtitle -->
  <text x="${centerX}" y="${subtitleY}"
        font-family="Arial, sans-serif"
        font-size="${subtitleSize}"
        font-weight="600"
        fill="${textColor}"
        text-anchor="middle"
        opacity="0.9">
    ${this.escapeXML(text.subtitle)}
  </text>

  <!-- Description (multiline if necessary) -->
  ${this.createMultilineText(
    text.description,
    centerX,
    descriptionY,
    descriptionSize,
    textColor,
    width * 0.8
  )}

  <!-- Call to action (button) -->
  <rect x="${centerX - text.callToAction.length * ctaSize * 0.3}"
        y="${ctaY - ctaSize}"
        width="${text.callToAction.length * ctaSize * 0.6}"
        height="${ctaSize * 1.8}"
        fill="${accentColor}"
        rx="25"
        filter="url(#shadow)"/>

  <text x="${centerX}" y="${ctaY}"
        font-family="Arial, sans-serif"
        font-size="${ctaSize}"
        font-weight="bold"
        fill="white"
        text-anchor="middle">
    ${this.escapeXML(text.callToAction)}
  </text>

  <!-- Decorative line -->
  <line x1="${width * 0.2}" y1="${height * 0.65}"
        x2="${width * 0.8}" y2="${height * 0.65}"
        stroke="${accentColor}"
        stroke-width="2"
        opacity="0.5"/>
</svg>`;
  }

  private createMultilineText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    maxWidth: number
  ): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    // Estimate characters per line based on maximum width
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));

    for (const word of words) {
      if ((currentLine + word).length <= charsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines
      .map((line, index) => {
        const lineY = y + index * fontSize * 1.2;
        return `<text x="${x}" y="${lineY}"
                     font-family="Arial, sans-serif"
                     font-size="${fontSize}"
                     fill="${color}"
                     text-anchor="middle"
                     opacity="0.8">
                ${this.escapeXML(line)}
              </text>`;
      })
      .join('\n');
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private darkenColor(color: string, factor: number): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken
    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  getContrastColor(backgroundColor: string): string {
    // Calculate background color luminosity
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white or black based on luminosity
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}
