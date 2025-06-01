import { consola } from 'consola';
import { FlyerGenerator } from '../FlyerGenerator';
import type { PromoConfig } from '../types';

// Example of flyer generator usage
async function basicExample() {
  consola.info('📋 Basic Example - Pizzeria');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Special Margherita Pizza',
    businessType: 'pizzeria',
    offer: '2x1 on family pizzas',
    validity: 'Valid until Sunday',
    location: 'Main St. #123',
    phone: '+1 555-PIZZA',
    schedule: 'Monday to Sunday 5:00 PM - 11:00 PM',
    colors: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateVariations(config, 5);
    consola.success(`✅ Generated ${flyers.length} flyers for pizzeria`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Quick example with simplified method
async function quickExample() {
  consola.info('⚡ Quick Example - Clothing Store');

  const generator = new FlyerGenerator();

  try {
    const flyers = await generator.generateCustomVariations(
      'Summer Clothing', // product
      '40% discount', // offer
      ['#FF6B6B', '#4ECDC4', '#45B7D1'], // colors
      3 // quantity
    );

    consola.success(`✅ Generated ${flyers.length} quick flyers`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Restaurant example
async function restaurantExample() {
  consola.info('🍽️ Restaurant Example - Italian Food');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Artisanal Pasta',
    businessType: 'italian restaurant',
    offer: 'Complete menu for $15',
    validity: 'This weekend only',
    location: 'Historic Center',
    phone: '+1 555-PASTA',
    schedule: 'Tuesday to Sunday 12:00 PM - 10:00 PM',
    colors: ['#27AE60', '#E67E22', '#C0392B', '#8E44AD'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    // Generate for all formats (Facebook, Instagram, Stories)
    const flyers = await generator.generateForAllFormats(config, 2);
    consola.success(`✅ Generated ${flyers.length} flyers in all formats`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Main function to run examples
async function main() {
  consola.info('🎨 PromoMaker - Usage Examples');

  // You can comment/uncomment the examples you want to try
  await basicExample();
  // await quickExample();
  // await restaurantExample();

  consola.info('✨ Examples completed. Check the ./output_flyers/ folder');
}

// Run only if it's the main file
if (import.meta.main) {
  main().catch(consola.error);
}
