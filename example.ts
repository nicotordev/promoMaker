import { consola } from 'consola';
import { FlyerGenerator } from './src/FlyerGenerator';
import type { PromoConfig } from './src/types';

// Simple usage example
async function simpleExample() {
  consola.info('🛠️ PromoMaker - Simple Example');

  const generator = new FlyerGenerator();

  // Basic configuration
  const config: PromoConfig = {
    product: 'Gourmet Hamburgers',
    businessType: 'restaurant',
    offer: '30% off for students',
    validity: 'Valid until end of month',
    location: 'Food Court, Shopping Mall',
    phone: '+1 555-BURGER',
    schedule: 'Monday to Sunday 10:00 AM - 10:00 PM',
    colors: ['#E74C3C', '#3498DB', '#2ECC71'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateVariations(config, 3);
    consola.success(`✅ Generated ${flyers.length} simple flyers`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Quick method example
async function quickExample() {
  consola.info('⚡ Quick Generation Example');

  const generator = new FlyerGenerator();

  try {
    // Quick generation without detailed configuration
    const flyers = await generator.generateCustomVariations(
      'Computer Courses', // product
      '40% discount on annual enrollment', // offer
      ['#4A90E2', '#50C878', '#FF6B35'], // colors
      3 // quantity
    );

    consola.success(`✅ Generated ${flyers.length} quick flyers`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// All formats example
async function allFormatsExample() {
  consola.info('📱 All Social Media Formats Example');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Facial Beauty Treatment',
    businessType: 'beauty salon',
    offer: 'Buy 2 sessions, get 1 free',
    validity: 'Valid throughout January',
    location: 'Beauty Center Plaza',
    phone: '+1 555-BEAUTY',
    schedule: 'Tuesday to Saturday 9:00 AM - 7:00 PM',
    colors: ['#FF69B4', '#E6E6FA', '#DDA0DD'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    // Generate for all formats: Facebook, Instagram, and Stories
    const flyers = await generator.generateForAllFormats(config, 2);
    consola.success(`✅ Generated ${flyers.length} flyers for all formats`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Main function to run all examples
async function main() {
  consola.info('🎨 PromoMaker - Usage Examples');
  consola.info(
    '📝 This file contains examples of different ways to use PromoMaker'
  );

  // You can comment/uncomment the ones you want to test
  await simpleExample();
  // await quickExample();
  // await allFormatsExample();

  consola.box(`
✨ Examples completed

📁 Check the results in: ./output_flyers/

💡 Remember:
- Each method has different advantages
- generateVariations() is good for a single format
- generateForAllFormats() creates for Facebook, Instagram and Stories
- generateCustomVariations() is the quickest for testing
  `);
}

// Execute only if this is the main file
if (import.meta.main) {
  main().catch(consola.error);
}

export { simpleExample, quickExample, allFormatsExample };
