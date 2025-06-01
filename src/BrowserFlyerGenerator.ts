import puppeteer, { Browser, Page } from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { PromoConfig, TextVariation } from './types.js';

export type FlyerFormat = 'square' | 'story' | 'post' | 'banner';

export interface UserPreferences extends PromoConfig {
  format: FlyerFormat;
  language?: string;
}

export class BrowserFlyerGenerator {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-default-apps',
        ],
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private generateFlyerHTML(
    preferences: UserPreferences,
    variations: Array<{ title: string; description: string; cta: string }>
  ): string {
    const {
      product,
      businessType,
      offer,
      validity,
      location,
      phone,
      schedule,
      colors,
      language,
    } = preferences;

    if (!variations || variations.length === 0) {
      throw new Error('No variations provided');
    }

    const selectedVariation = variations[0]!; // Use first variation (non-null assertion after check)

    const colorPalette = this.getColorClasses(colors);

    return `
<!DOCTYPE html>
<html lang="${language || 'es'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flyer - ${product}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      ${this.getInlineCSS()}
    </style>
</head>
<body class="bg-gradient-to-br from-primary-50 to-secondary-50 p-8">
    <div class="flyer-container max-w-2xl mx-auto ${this.getFlyerSizeClass(
      preferences.format
    )}">
        <!-- Header with gradient background -->
        <div class="flyer-header p-8 text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r ${
              colorPalette.gradient
            } opacity-90"></div>
            <div class="relative z-10">
                <div class="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center business-logo">
                    <span class="text-2xl font-bold ${
                      colorPalette.text
                    }">${businessType.charAt(0).toUpperCase()}</span>
                </div>
                <h1 class="text-3xl font-heading font-bold text-white mb-2">${
                  selectedVariation.title
                }</h1>
                <div class="offer-badge inline-block">
                    <span class="text-lg font-bold">${offer}</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flyer-content space-y-6">
            <!-- Product Description -->
            <div class="text-center">
                <h2 class="text-xl font-semibold ${
                  colorPalette.textSecondary
                } mb-3">${product}</h2>
                <p class="text-gray-600 leading-relaxed">${
                  selectedVariation.description
                }</p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gradient-to-r ${
                  colorPalette.lightGradient
                } p-4 rounded-lg">
                    <div class="text-center">
                        <div class="w-12 h-12 ${
                          colorPalette.bg
                        } rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span class="text-xl">🎯</span>
                        </div>
                        <h3 class="font-semibold ${
                          colorPalette.text
                        }">Calidad Premium</h3>
                    </div>
                </div>
                <div class="bg-gradient-to-r ${
                  colorPalette.lightGradient
                } p-4 rounded-lg">
                    <div class="text-center">
                        <div class="w-12 h-12 ${
                          colorPalette.bg
                        } rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span class="text-xl">⚡</span>
                        </div>
                        <h3 class="font-semibold ${
                          colorPalette.text
                        }">Entrega Rápida</h3>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="text-center bg-gradient-to-r ${
              colorPalette.gradient
            } p-6 rounded-xl text-white">
                <h3 class="text-xl font-bold mb-2">${selectedVariation.cta}</h3>
                ${
                  validity
                    ? `<p class="text-sm opacity-90 mb-4">Válido hasta: ${validity}</p>`
                    : ''
                }
                <div class="space-y-2">
                    ${phone ? `<p class="font-semibold">📞 ${phone}</p>` : ''}
                    ${location ? `<p class="text-sm">📍 ${location}</p>` : ''}
                    ${schedule ? `<p class="text-sm">🕒 ${schedule}</p>` : ''}
                </div>
            </div>

            <!-- Business Type Badge -->
            <div class="text-center">
                <span class="inline-block bg-gray-100 ${
                  colorPalette.textSecondary
                } px-4 py-2 rounded-full text-sm font-medium">
                    ${businessType}
                </span>
            </div>
        </div>

        <!-- Decorative Elements -->
        <div class="absolute top-4 right-4 w-16 h-16 ${
          colorPalette.bg
        } rounded-full opacity-20 animate-pulse-slow"></div>
        <div class="absolute bottom-4 left-4 w-12 h-12 ${
          colorPalette.bgSecondary
        } rounded-full opacity-20 animate-bounce-gentle"></div>
    </div>
</body>
</html>`;
  }

  private getInlineCSS(): string {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

      /* Tailwind CSS v4 Variables */
      :root {
        --color-primary-50: #faf5ff;
        --color-primary-500: #a855f7;
        --color-primary-600: #9333ea;
        --color-secondary-50: #fdf2f8;
        --color-secondary-500: #ec4899;
        --color-secondary-600: #db2777;
        --font-family-sans: 'Inter', system-ui, sans-serif;
        --font-family-heading: 'Poppins', system-ui, sans-serif;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: var(--font-family-sans);
        line-height: 1.6;
      }

      .font-heading { font-family: var(--font-family-heading); }

      .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
      .from-primary-50 { --tw-gradient-from: var(--color-primary-50); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0)); }
      .to-secondary-50 { --tw-gradient-to: var(--color-secondary-50); }

      .flyer-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        position: relative;
        overflow: hidden;
      }

      .business-logo {
        border: 4px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .offer-badge {
        background: linear-gradient(135deg, var(--color-secondary-500), var(--color-primary-500));
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-weight: 700;
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
      }

      @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes bounce-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }

      .p-8 { padding: 2rem; }
      .p-6 { padding: 1.5rem; }
      .p-4 { padding: 1rem; }
      .p-2 { padding: 0.5rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 0.75rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .max-w-2xl { max-width: 42rem; }
      .w-20 { width: 5rem; }
      .h-20 { height: 5rem; }
      .w-16 { width: 4rem; }
      .h-16 { height: 4rem; }
      .w-12 { width: 3rem; }
      .h-12 { height: 3rem; }
      .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      .text-center { text-align: center; }
      .text-white { color: white; }
      .text-gray-600 { color: #4b5563; }
      .bg-white { background-color: white; }
      .bg-gray-100 { background-color: #f3f4f6; }
      .rounded-full { border-radius: 9999px; }
      .rounded-lg { border-radius: 0.5rem; }
      .rounded-xl { border-radius: 0.75rem; }
      .flex { display: flex; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .gap-4 { gap: 1rem; }
      .gap-6 { gap: 1.5rem; }
      .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
      .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .relative { position: relative; }
      .absolute { position: absolute; }
      .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
      .top-4 { top: 1rem; }
      .right-4 { right: 1rem; }
      .bottom-4 { bottom: 1rem; }
      .left-4 { left: 1rem; }
      .z-10 { z-index: 10; }
      .opacity-90 { opacity: 0.9; }
      .opacity-20 { opacity: 0.2; }
      .overflow-hidden { overflow: hidden; }
      .inline-block { display: inline-block; }
      .leading-relaxed { line-height: 1.625; }
    `;
  }

  private getColorClasses(colors: string[]) {
    // Map color names to Tailwind classes
    const colorMappings: Record<string, any> = {
      purple: {
        gradient: 'from-purple-600 to-purple-700',
        lightGradient: 'from-purple-50 to-purple-100',
        bg: 'bg-purple-500',
        bgSecondary: 'bg-purple-300',
        text: 'text-purple-700',
        textSecondary: 'text-purple-600',
      },
      pink: {
        gradient: 'from-pink-600 to-pink-700',
        lightGradient: 'from-pink-50 to-pink-100',
        bg: 'bg-pink-500',
        bgSecondary: 'bg-pink-300',
        text: 'text-pink-700',
        textSecondary: 'text-pink-600',
      },
      blue: {
        gradient: 'from-blue-600 to-blue-700',
        lightGradient: 'from-blue-50 to-blue-100',
        bg: 'bg-blue-500',
        bgSecondary: 'bg-blue-300',
        text: 'text-blue-700',
        textSecondary: 'text-blue-600',
      },
      green: {
        gradient: 'from-green-600 to-green-700',
        lightGradient: 'from-green-50 to-green-100',
        bg: 'bg-green-500',
        bgSecondary: 'bg-green-300',
        text: 'text-green-700',
        textSecondary: 'text-green-600',
      },
      red: {
        gradient: 'from-red-600 to-red-700',
        lightGradient: 'from-red-50 to-red-100',
        bg: 'bg-red-500',
        bgSecondary: 'bg-red-300',
        text: 'text-red-700',
        textSecondary: 'text-red-600',
      },
    };

    const primaryColor = colors[0]?.toLowerCase() || 'purple';
    return colorMappings[primaryColor] || colorMappings.purple;
  }

  private getFlyerSizeClass(format: FlyerFormat): string {
    switch (format) {
      case 'square':
        return 'w-[600px] h-[600px]';
      case 'story':
        return 'w-[400px] h-[700px]';
      case 'post':
        return 'w-[500px] h-[500px]';
      case 'banner':
        return 'w-[800px] h-[400px]';
      default:
        return 'w-[600px] h-[600px]';
    }
  }

  async generateFlyer(
    preferences: UserPreferences,
    variations: Array<{ title: string; description: string; cta: string }>,
    outputPath?: string
  ): Promise<string> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    try {
      // Set viewport based on format
      const dimensions = this.getViewportDimensions(preferences.format);
      await page.setViewport({
        width: dimensions.width,
        height: dimensions.height,
        deviceScaleFactor: 2, // High DPI for better quality
      });

      // Generate HTML content
      const html = this.generateFlyerHTML(preferences, variations);

      // Set content and wait for fonts to load
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Take screenshot
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
        omitBackground: false,
        encoding: 'binary',
      });

      // Save to file
      const finalOutputPath =
        outputPath || this.generateOutputPath(preferences);

      // Ensure output directory exists
      const outputDir = join(process.cwd(), 'output_flyers');
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(finalOutputPath, screenshotBuffer);

      console.log(`✅ Flyer generado exitosamente: ${finalOutputPath}`);
      return finalOutputPath;
    } finally {
      await page.close();
    }
  }

  private getViewportDimensions(format: FlyerFormat) {
    switch (format) {
      case 'square':
        return { width: 600, height: 600 };
      case 'story':
        return { width: 400, height: 700 };
      case 'post':
        return { width: 500, height: 500 };
      case 'banner':
        return { width: 800, height: 400 };
      default:
        return { width: 600, height: 600 };
    }
  }

  private generateOutputPath(preferences: UserPreferences): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedProduct = preferences.product.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `flyer_${sanitizedProduct}_${timestamp}.png`;
    return join(process.cwd(), 'output_flyers', filename);
  }

  async generateMultipleFlyers(
    preferences: UserPreferences,
    variations: Array<{ title: string; description: string; cta: string }>,
    quantity: number = 1
  ): Promise<string[]> {
    const results: string[] = [];

    if (!variations || variations.length === 0) {
      throw new Error('No variations provided');
    }

    for (let i = 0; i < Math.min(quantity, variations.length); i++) {
      const currentVariation = variations[i];
      if (!currentVariation) continue;

      const variation = [currentVariation];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedProduct = preferences.product.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      );
      const filename = `flyer_${sanitizedProduct}_v${i + 1}_${timestamp}.png`;
      const outputPath = join(process.cwd(), 'output_flyers', filename);

      const result = await this.generateFlyer(
        preferences,
        variation,
        outputPath
      );
      results.push(result);
    }

    return results;
  }
}
