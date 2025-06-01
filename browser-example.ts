#!/usr/bin/env bun

import {
  BrowserFlyerGenerator,
  type UserPreferences,
} from './src/BrowserFlyerGenerator.js';
import { TextGenerator } from './src/TextGenerator.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import consola from 'consola';

// Check for API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  consola.error('Please set your OPENAI_API_KEY environment variable');
  consola.info(
    'You can get your API key from: https://platform.openai.com/api-keys'
  );
  process.exit(1);
}

async function generateBrowserFlyer() {
  consola.start('🎨 Iniciando PromoMaker con TailwindCSS + Puppeteer...\n');

  // Example preferences (could come from CLI or interactive input)
  const preferences: UserPreferences = {
    product: 'Pizza Margherita Especial',
    businessType: 'Restaurante',
    offer: '50% OFF en tu primera orden',
    validity: '31 de Diciembre 2024',
    location: 'Av. Providencia 123, Santiago',
    phone: '+56 9 1234 5678',
    schedule: 'Lun-Dom 11:00-23:00',
    colors: ['purple', 'pink'],
    format: 'square',
    language: 'spanish',
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    // Initialize text generator
    consola.info('🤖 Generando contenido con IA...');
    const textGenerator = new TextGenerator();

    // Generate text variations
    const variations = await textGenerator.generateVariations(
      preferences,
      3,
      preferences.language || 'Spanish'
    );

    if (!variations || variations.length === 0) {
      throw new Error('No se pudieron generar variaciones de texto');
    }

    consola.success(`✅ ${variations.length} variaciones de texto generadas`);

    // Convert TextVariation to the format expected by BrowserFlyerGenerator
    const flyerVariations = variations.map((v) => ({
      title: v.title,
      description: v.description,
      cta: v.callToAction,
    }));

    // Initialize browser flyer generator
    consola.info('🌐 Inicializando generador de flyers basado en navegador...');
    const browserGenerator = new BrowserFlyerGenerator();
    await browserGenerator.initialize();

    // Generate multiple flyers
    consola.info('🎨 Generando flyers con TailwindCSS...');
    const results = await browserGenerator.generateMultipleFlyers(
      preferences,
      flyerVariations,
      Math.min(3, flyerVariations.length)
    );

    // Clean up
    await browserGenerator.close();

    // Display results
    consola.box('🎉 ¡Flyers generados exitosamente!');
    results.forEach((path, index) => {
      consola.success(`Flyer ${index + 1}: ${path}`);
    });

    consola.info('\n📋 Características de los flyers generados:');
    consola.info(`• Formato: ${preferences.format}`);
    consola.info(`• Colores: ${preferences.colors.join(', ')}`);
    consola.info(`• Idioma: ${preferences.language}`);
    consola.info(`• Tecnología: TailwindCSS v4 + Puppeteer`);
    consola.info(`• Calidad: Alta resolución (2x DPI)`);
    consola.info(`• Tipografías: Inter + Poppins`);

    return results;
  } catch (error) {
    consola.error('❌ Error durante la generación:', error);
    throw error;
  }
}

// Test different formats
async function testMultipleFormats() {
  const formats: Array<UserPreferences['format']> = [
    'square',
    'story',
    'banner',
    'post',
  ];

  for (const format of formats) {
    consola.info(`\n🔄 Probando formato: ${format}`);

    const preferences: UserPreferences = {
      product: 'Café Premium',
      businessType: 'Cafetería',
      offer: '2x1 en todos los cafés',
      validity: '15 de Enero 2025',
      location: 'Mall Plaza Norte',
      phone: '+56 9 8765 4321',
      schedule: 'Lun-Vie 7:00-19:00',
      colors: ['blue', 'green'],
      format: format,
      language: 'spanish',
      sizes: {
        facebook: { width: 1200, height: 630 },
        instagram: { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 },
      },
    };

    try {
      const textGenerator = new TextGenerator();
      const variations = await textGenerator.generateVariations(
        preferences,
        1,
        'Spanish'
      );

      if (variations && variations.length > 0) {
        const flyerVariations = variations.map((v) => ({
          title: v.title,
          description: v.description,
          cta: v.callToAction,
        }));

        const browserGenerator = new BrowserFlyerGenerator();
        await browserGenerator.initialize();

        const result = await browserGenerator.generateFlyer(
          preferences,
          flyerVariations
        );
        await browserGenerator.close();

        consola.success(`✅ Flyer ${format} generado: ${result}`);
      }
    } catch (error) {
      consola.error(`❌ Error generando formato ${format}:`, error);
    }
  }
}

// Main execution
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes('--test-formats')) {
    await testMultipleFormats();
  } else {
    await generateBrowserFlyer();
  }

  consola.success('\n🎊 Proceso completado exitosamente!');
  process.exit(0);
}
