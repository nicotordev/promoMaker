import { consola } from 'consola';
import { FlyerGenerator } from '../FlyerGenerator';
import type { PromoConfig } from '../types';

// Example for SPA/Beauty
async function beautyExample() {
  consola.info('💅 SPA/Beauty Example');

  const generator = new FlyerGenerator();
  const config: PromoConfig = {
    product: 'Anti-aging Facial Treatment',
    businessType: 'beauty spa',
    offer: '50% off on facial treatments',
    validity: 'Valid until end of month',
    location: 'Pink Zone, Plaza Shopping Center',
    phone: '+1 555-BEAUTY',
    schedule: 'Monday to Saturday 9:00 AM - 8:00 PM',
    colors: ['#FF69B4', '#E6E6FA', '#DDA0DD', '#F0E68C', '#FFB6C1', '#E0B4D6'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateForAllFormats(config, 3);
    consola.success(`✅ Generated ${flyers.length} flyers for spa`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Example for Gym/Fitness
async function gymExample() {
  consola.info('💪 Gym/Fitness Example');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Complete Annual Membership',
    businessType: 'gym',
    offer: '3 months free + personal trainer',
    validity: 'Offer valid this week only',
    location: 'Fitness Ave #456',
    phone: '+1 555-STRONG',
    schedule: '24/7 - Open every day',
    colors: ['#FF4500', '#32CD32', '#1E90FF', '#FFD700', '#DC143C', '#000000'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateVariations(config, 4);
    consola.success(`✅ Generated ${flyers.length} flyers for gym`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Example for School/Courses
async function educationExample() {
  consola.info('📚 Education/Courses Example');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Web Programming Course',
    businessType: 'technology academy',
    offer: '40% discount + free certification',
    validity: 'Enrollment until January 15th',
    location: 'Virtual and On-site Campus',
    phone: '+1 555-LEARN',
    schedule: 'Classes Monday to Friday 6:00 PM - 9:00 PM',
    colors: ['#4A90E2', '#50C878', '#FF6B35', '#9B59B6', '#E67E22', '#34495E'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateCustomVariations(
      config.product,
      config.offer,
      config.colors,
      5
    );
    consola.success(`✅ Generated ${flyers.length} educational flyers`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Example for Event/Party
async function eventExample() {
  consola.info('🎉 Event/Party Example');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'New Year\'s Party 2024',
    businessType: 'event organizer',
    offer: 'Early bird $25 (regular price $40)',
    validity: 'Until tickets sell out or December 31st',
    location: 'Paradise Nightclub - Downtown',
    phone: '+1 555-PARTY',
    schedule: 'December 31st 9:00 PM - 4:00 AM',
    colors: ['#FFD700', '#FF1493', '#00FF7F', '#FF4500', '#8A2BE2', '#DC143C'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateForAllFormats(config, 2);
    consola.success(`✅ Generated ${flyers.length} flyers for event`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Example for Real Estate
async function realEstateExample() {
  consola.info('🏠 Real Estate Example');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'House for Sale - 3 bedrooms',
    businessType: 'real estate',
    offer: 'No down payment financing',
    validity: 'Promotion valid until end of year',
    location: 'Los Pinos Residential, North Sector',
    phone: '+1 555-HOUSE',
    schedule: 'Visits Monday to Sunday 9:00 AM - 6:00 PM',
    colors: ['#2C3E50', '#E74C3C', '#3498DB', '#27AE60', '#F39C12', '#8E44AD'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateVariations(config, 3);
    consola.success(`✅ Generated ${flyers.length} real estate flyers`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Example for Automotive Services
async function automotiveExample() {
  consola.info('🚗 Automotive Services Example');

  const generator = new FlyerGenerator();

  const config: PromoConfig = {
    product: 'Complete Maintenance Service',
    businessType: 'auto repair shop',
    offer: 'Oil change + inspection FREE',
    validity: 'Only this month',
    location: 'North Highway Km 15',
    phone: '+1 555-MOTOR',
    schedule: 'Monday to Saturday 7:00 AM - 6:00 PM',
    colors: ['#2C3E50', '#E74C3C', '#F39C12', '#95A5A6', '#34495E', '#E67E22'],
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  try {
    const flyers = await generator.generateCustomVariations(
      config.product,
      config.offer,
      config.colors,
      3
    );
    consola.success(`✅ Generated ${flyers.length} automotive flyers`);
  } catch (error) {
    consola.error('❌ Error:', error);
  }
}

// Main function that runs all examples
async function main() {
  consola.info('🎨 PromoMaker - Advanced Examples');
  consola.info('📝 These examples show different types of businesses');

  // You can comment/uncomment the ones you want to test
  await beautyExample();
  // await gymExample();
  // await educationExample();
  // await eventExample();
  // await realEstateExample();
  // await automotiveExample();

  consola.box(`
✨ Advanced examples completed

📁 Check results in: ./output_flyers/

💡 Tips:
- Each example uses specific colors for the business type
- Texts are automatically generated with AI
- You can customize any configuration
- Experiment with different combinations
  `);
}

// Run only if it's the main file
if (import.meta.main) {
  main().catch(consola.error);
}

export {
  beautyExample,
  gymExample,
  educationExample,
  eventExample,
  realEstateExample,
  automotiveExample,
};
