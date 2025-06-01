#!/usr/bin/env bun
import { consola } from 'consola';
import { FlyerGenerator } from './src/FlyerGenerator';
import type { PromoConfig } from './src/types';

// Predefined color palettes for different business types
const colorPalettes = {
  // NicoTorDev's custom palette (main theme)
  nicotordev: [
    '#8B5CF6', // main-600
    '#EC4899', // secondary-500
    '#A855F7', // main-500
    '#F472B6', // secondary-400
    '#7C3AED', // main-700
    '#E879F9', // secondary-300
  ],
  // Professional/tech palette based on your theme
  professional: [
    '#8B5CF6', // main
    '#6366F1', // indigo
    '#3B82F6', // blue
    '#06B6D4', // cyan
    '#10B981', // emerald
    '#EC4899', // secondary
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
  'technology academy': [
    '#4A90E2',
    '#50C878',
    '#FF6B35',
    '#9B59B6',
    '#E67E22',
    '#34495E',
  ],
  'event organizer': [
    '#FFD700',
    '#FF1493',
    '#00FF7F',
    '#FF4500',
    '#8A2BE2',
    '#DC143C',
  ],
  'real estate': [
    '#2C3E50',
    '#E74C3C',
    '#3498DB',
    '#27AE60',
    '#F39C12',
    '#8E44AD',
  ],
  'auto shop': [
    '#2C3E50',
    '#E74C3C',
    '#F39C12',
    '#95A5A6',
    '#34495E',
    '#E67E22',
  ],
  'retail store': [
    '#E74C3C',
    '#3498DB',
    '#2ECC71',
    '#F39C12',
    '#9B59B6',
    '#1ABC9C',
  ],
  'digital marketing': [
    '#3498DB',
    '#E74C3C',
    '#2ECC71',
    '#F39C12',
    '#9B59B6',
    '#E67E22',
  ],
  'professional services': [
    '#34495E',
    '#3498DB',
    '#2ECC71',
    '#E67E22',
    '#9B59B6',
    '#95A5A6',
  ],
};

interface UserPreferences {
  config: PromoConfig;
  formatChoice: string;
  quantity: number;
  language: string;
}

async function promptUser(): Promise<UserPreferences> {
  consola.info('🎨 Welcome to PromoMaker Interactive Generator!');
  consola.info(
    "📝 I'll ask you some questions to create amazing promotional flyers"
  );

  console.log('\n');

  // Language selection
  const language = await consola.prompt(
    '🌐 In which language should I generate the content?',
    {
      type: 'select',
      options: [
        'English',
        'Spanish',
        'French',
        'German',
        'Italian',
        'Portuguese',
        'Other (will use English as fallback)',
      ],
    }
  );

  const finalLanguage =
    language === 'Other (will use English as fallback)' ? 'English' : language;

  // Product/Service
  const product = await consola.prompt(
    '🛍️ What product or service are you promoting?',
    {
      type: 'text',
      placeholder: 'e.g., Italian Pizza, Beauty Treatment, Programming Course',
    }
  );

  // Business Type with predefined options
  const businessTypeOptions = Object.keys(colorPalettes);
  const businessType = await consola.prompt('🏢 What type of business is it?', {
    type: 'select',
    options: [...businessTypeOptions, 'other (custom)'],
  });

  let finalBusinessType = businessType;
  if (businessType === 'other (custom)') {
    finalBusinessType = await consola.prompt(
      '🏪 Please specify your business type:',
      {
        type: 'text',
        placeholder: 'e.g., coffee shop, bakery, consulting',
      }
    );
  }

  // Offer
  const offer = await consola.prompt(
    "🎁 What's your special offer or promotion?",
    {
      type: 'text',
      placeholder: 'e.g., 50% discount, Buy 2 Get 1 Free, Free consultation',
    }
  );

  // Validity
  const validity = await consola.prompt('⏰ How long is this offer valid?', {
    type: 'text',
    placeholder: 'e.g., Until end of month, Only this weekend, Limited time',
  });

  // Location
  const location = await consola.prompt('📍 Where is your business located?', {
    type: 'text',
    placeholder: 'e.g., Downtown Mall, 123 Main Street, Online only',
  });

  // Phone
  const phone = await consola.prompt("📞 What's your contact phone number?", {
    type: 'text',
    placeholder: 'e.g., +1 555-123-4567, (555) 123-4567',
  });

  // Schedule
  const schedule = await consola.prompt('🕒 What are your business hours?', {
    type: 'text',
    placeholder: 'e.g., Mon-Sat 9AM-8PM, 24/7, By appointment',
  });

  // Colors
  const usePresetColors = await consola.prompt(
    '🎨 Do you want to use preset colors for your business type?',
    {
      type: 'confirm',
      initial: true,
    }
  );

  let colors: string[];
  if (usePresetColors && businessType in colorPalettes) {
    colors = colorPalettes[businessType as keyof typeof colorPalettes];
    consola.success(
      `✅ Using ${businessType} color palette: ${colors.join(', ')}`
    );
  } else {
    const customColors = await consola.prompt(
      '🌈 Enter your custom colors (hex format, separated by commas):',
      {
        type: 'text',
        placeholder: '#FF6B6B, #4ECDC4, #45B7D1',
        initial: '#3498DB, #E74C3C, #2ECC71, #F39C12',
      }
    );
    colors = customColors.split(',').map((color: string) => color.trim());
  }

  // Format selection
  const formatChoice = await consola.prompt(
    '📱 Which formats do you want to generate?',
    {
      type: 'select',
      options: [
        'All formats (Facebook, Instagram, Stories)',
        'Facebook only (1200x630)',
        'Instagram only (1080x1080)',
        'Stories only (1080x1920)',
      ],
    }
  );

  // Quantity
  const quantity = await consola.prompt(
    '🔢 How many text variations do you want?',
    {
      type: 'text',
      placeholder: 'Enter a number between 1-10',
      initial: '3',
    }
  );

  const quantityNum = parseInt(quantity) || 3;
  if (quantityNum < 1 || quantityNum > 10) {
    consola.warn('⚠️  Quantity adjusted to 3 (valid range: 1-10)');
  }

  // Build config object
  const config: PromoConfig = {
    product,
    businessType: finalBusinessType,
    offer,
    validity,
    location,
    phone,
    schedule,
    colors,
    sizes: {
      facebook: { width: 1200, height: 630 },
      instagram: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
    },
  };

  return {
    config,
    formatChoice,
    quantity: Math.min(Math.max(quantityNum, 1), 10),
    language: finalLanguage,
  };
}

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

  const shouldContinue = await consola.prompt(
    '✅ Does this look correct? Continue with generation?',
    {
      type: 'confirm',
      initial: true,
    }
  );

  if (!shouldContinue) {
    consola.info('❌ Generation cancelled by user');
    return;
  }

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

    // Ask if user wants to generate more
    const generateMore = await consola.prompt(
      '🔄 Would you like to generate more flyers?',
      {
        type: 'confirm',
        initial: false,
      }
    );

    if (generateMore) {
      console.log('\n' + '='.repeat(60) + '\n');
      await main(); // Restart the process
    }
  } catch (error) {
    consola.error('❌ Error during generation:', error);

    const retry = await consola.prompt('🔄 Would you like to try again?', {
      type: 'confirm',
      initial: true,
    });

    if (retry) {
      await generateFlyers(config, formatChoice, quantity, language);
    }
  }
}

async function main() {
  try {
    // Show welcome banner
    console.clear();
    consola.box(`
🎨 PromoMaker Interactive Generator 🚀

✨ Create stunning promotional flyers with AI
📱 Multiple social media formats
🎯 Customized for your business
💡 Powered by OpenAI GPT

Let's get started! 🎉
    `);

    // Check if API key is configured
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
    console.log('\n');

    // Get user preferences
    const { config, formatChoice, quantity, language } = await promptUser();

    console.log('\n');

    // Generate flyers
    await generateFlyers(config, formatChoice, quantity, language);
  } catch (error) {
    consola.error('❌ Unexpected error:', error);
  }
}

// Run if this is the main file
if (import.meta.main) {
  main().catch(consola.error);
}

export { main };
