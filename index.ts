import { consola } from 'consola';
import { FlyerGenerator } from './src/FlyerGenerator';
import type { PromoConfig } from './src/types';

// Main example: Pizza restaurant promotion
async function main() {
  consola.info('🎨 PromoMaker - Promotional Flyer Generator with AI');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Special Italian Pizza',
    businessType: 'restaurant',
    offer: '50% off all pizzas',
    validity: 'Valid only this weekend',
    location: 'Downtown, Main Street 123',
    phone: '+1 234 567 890',
    schedule: 'Open from 11:00 AM to 11:00 PM',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    consola.start('🚀 Starting promotional flyer generation...');

    // Generate 6 flyer variations
    const flyers = await generator.generateVariations(config, 6);

    consola.success(
      `✅ Generated ${flyers.length} flyer variations successfully`
    );

    // Display summary
    flyers.forEach((flyer, index) => {
      consola.info(
        `📄 Flyer ${index + 1}: ${flyer.filename} (Tone: ${
          flyer.textVariation.tone
        })`
      );
    });

    consola.box(`
🎉 Generation completed!

📁 Files saved in: ./output_flyers/

💡 Tips:
- Check the generated flyers in the output folder
- Each flyer has a different tone and color
- Text variations are automatically generated with AI
- You can customize colors, sizes and other parameters
    `);
  } catch (error) {
    consola.error('❌ Error generating flyers:', error);
  }
}

// Execute if this is the main file
if (import.meta.main) {
  main().catch(consola.error);
}

export { main };
