#!/usr/bin/env bun
import { consola } from 'consola';
import { Command } from 'commander';
import { FlyerGenerator } from './src/FlyerGenerator';
import type { PromoConfig } from './src/types';

async function generateFlyers(
  config: PromoConfig,
  formatChoice: string,
  quantity: number,
  language: string
) {
  consola.start('🚀 Starting flyer generation process...');

  const generator = new FlyerGenerator();

  // Show configuration summary
  consola.box(`
📋 Generation Summary:

🛍️  Product: ${config.product}
🏢 Business: ${config.businessType}
🎁 Offer: ${config.offer}
⏰ Validity: ${config.validity}
📍 Location: ${config.location}
📞 Phone: ${config.phone}
🕒 Schedule: ${config.schedule}
🎨 Colors: ${config.colors.join(', ')}
📱 Format: ${formatChoice}
🔢 Quantity: ${quantity}
🌐 Language: ${language}
  `);

  try {
    let flyers;

    consola.info('🤖 Generating AI-powered text variations...');

    switch (formatChoice) {
      case 'All formats (Facebook, Instagram, Stories)':
        flyers = await generator.generateForAllFormats(
          config,
          quantity,
          language
        );
        break;
      case 'Instagram only (1080x1080)':
        flyers = await generator.generateVariations(config, quantity, language);
        break;
      case 'Stories only (1080x1920)':
        flyers = await generator.generateVariations(config, quantity, language);
        break;
      default: // Facebook only
        flyers = await generator.generateVariations(config, quantity, language);
        break;
    }

    consola.success(
      `🎉 Successfully generated ${flyers.length} promotional flyers!`
    );

    // Show results summary
    consola.info('\n📊 Generated Files:');
    flyers.forEach((flyer, index) => {
      consola.info(`   ${index + 1}. ${flyer.filename}`);
      consola.info(`      📝 Tone: ${flyer.textVariation.tone}`);
      consola.info(`      🎨 Color: ${flyer.color}`);
      consola.info(`      📱 Format: ${flyer.format}`);
      consola.info(`      💬 Title: "${flyer.textVariation.title}"`);
      console.log('');
    });

    // Final success message
    consola.box(`
🎉 Flyer Generation Complete!

📁 Files saved in: ./output_flyers/
🖼️  Total flyers: ${flyers.length}
📱 Formats: ${[...new Set(flyers.map((f) => f.format))].join(', ')}

💡 Next steps:
- Check the generated flyers in the output folder
- Use them in your marketing campaigns
- Generate more variations anytime!

🚀 Happy marketing!
    `);
  } catch (error) {
    consola.error('❌ Error during generation:', error);
    process.exit(1);
  }
}

async function main() {
  const program = new Command();

  program
    .name('promomaker')
    .description('Generate promotional flyers with AI')
    .version('1.0.0')
    .option('-p, --product <product>', 'Product or service name')
    .option('-b, --business <type>', 'Business type')
    .option('-o, --offer <offer>', 'Special offer or promotion')
    .option(
      '-v, --validity <validity>',
      'Offer validity period',
      'Limited time offer'
    )
    .option('-l, --location <location>', 'Business location', 'Visit our store')
    .option('--phone <phone>', 'Contact phone number', 'Contact us')
    .option('-s, --schedule <schedule>', 'Business hours', 'Business hours')
    .option(
      '-c, --colors <colors>',
      'Comma-separated hex colors (or use: nicotordev, professional, restaurant, etc.)',
      '#8B5CF6,#EC4899,#A855F7,#F472B6,#7C3AED,#E879F9'
    )
    .option(
      '-f, --format <format>',
      'Output format (all|facebook|instagram|stories)',
      'all'
    )
    .option('-q, --quantity <quantity>', 'Number of variations (1-10)', '3')
    .option(
      '--language <language>',
      'Content language (English|Spanish|French|German|Italian|Portuguese)',
      'English'
    )
    .parse();

  const options = program.opts();

  // Validate required CLI parameters
  if (!options.product || !options.business || !options.offer) {
    consola.error('❌ Missing required parameters!');
    consola.info('💡 Required: --product, --business, --offer');
    consola.info(
      '📝 Example: bun run cli --product "Pizza" --business "restaurant" --offer "50% off"'
    );
    program.help();
    return;
  }

  // Check API key
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here'
  ) {
    consola.error('❌ OpenAI API Key not configured!');
    consola.info('💡 Please run: bun run setup');
    consola.info('📝 Then edit .env file with your OpenAI API key');
    return;
  }

  consola.success('✅ OpenAI API Key detected');

  // Predefined color palettes
  const colorPalettes: Record<string, string[]> = {
    nicotordev: [
      '#8B5CF6',
      '#EC4899',
      '#A855F7',
      '#F472B6',
      '#7C3AED',
      '#E879F9',
    ],
    professional: [
      '#8B5CF6',
      '#6366F1',
      '#3B82F6',
      '#06B6D4',
      '#10B981',
      '#EC4899',
    ],
    restaurant: [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FECA57',
      '#FF9FF3',
    ],
    'beauty spa': [
      '#FF69B4',
      '#E6E6FA',
      '#DDA0DD',
      '#F0E68C',
      '#FFB6C1',
      '#E0B4D6',
    ],
    gym: ['#FF4500', '#32CD32', '#1E90FF', '#FFD700', '#DC143C', '#000000'],
    'digital marketing': [
      '#3498DB',
      '#E74C3C',
      '#2ECC71',
      '#F39C12',
      '#9B59B6',
      '#E67E22',
    ],
  };

  // Parse colors - check if it's a palette name or custom colors
  let colors: string[];
  const colorInput = options.colors.toLowerCase();
  if (colorPalettes[colorInput]) {
    colors = colorPalettes[colorInput];
    consola.info(`🎨 Using ${colorInput} color palette`);
  } else {
    colors = options.colors.split(',').map((c: string) => c.trim());
  }

  // Parse CLI options into config
  const config: PromoConfig = {
    product: options.product,
    businessType: options.business,
    offer: options.offer,
    validity: options.validity,
    location: options.location,
    phone: options.phone,
    schedule: options.schedule,
    colors: colors,
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  const quantity = Math.min(Math.max(parseInt(options.quantity) || 3, 1), 10);
  const language = options.language;

  // Map format option
  let formatChoice = 'All formats (Facebook, Instagram, Stories)';
  switch (options.format.toLowerCase()) {
    case 'facebook':
      formatChoice = 'Facebook only (1200x630)';
      break;
    case 'instagram':
      formatChoice = 'Instagram only (1080x1080)';
      break;
    case 'stories':
    case 'story':
      formatChoice = 'Stories only (1080x1920)';
      break;
  }

  consola.info('🚀 Running PromoMaker in CLI mode...');
  await generateFlyers(config, formatChoice, quantity, language);
}

// Run if this is the main file
if (import.meta.main) {
  main().catch(consola.error);
}

export { main };
