import { consola } from 'consola';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Script for initial project setup
async function setup() {
  consola.info('🔧 Setting up PromoMaker...');

  try {
    // Create output directory
    if (!existsSync('./output_flyers')) {
      await mkdir('./output_flyers', { recursive: true });
      consola.success('✅ Directory ./output_flyers/ created');
    }

    // Create .env file if it doesn't exist
    if (!existsSync('./.env')) {
      const envContent = `# OpenAI Configuration
# Get your API Key at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Configure the OpenAI model to use
# OPENAI_MODEL=gpt-3.5-turbo

# Optional: Output directory for generated flyers
# OUTPUT_DIR=./output_flyers
`;

      await writeFile('./.env', envContent);
      consola.success('✅ .env file created');
      consola.warn('⚠️  Remember to edit .env and add your OPENAI_API_KEY');
    } else {
      consola.info('ℹ️  .env file already exists');
    }

    // Show instructions
    consola.box(`
🎨 PromoMaker successfully configured!

📋 Next steps:

1. Edit the .env file and add your OPENAI_API_KEY
   Get one at: https://platform.openai.com/api-keys

2. Run an example:
   bun run example

3. Or use the main generator:
   bun run start

4. Customize examples by editing index.ts or example.ts

📁 Flyers will be saved in: ./output_flyers/
    `);
  } catch (error) {
    consola.error('❌ Error during setup:', error);
  }
}

// Script to verify configuration
async function verify() {
  consola.info('🔍 Verifying configuration...');

  const checks = [
    {
      name: 'output_flyers directory',
      check: () => existsSync('./output_flyers'),
    },
    { name: '.env file', check: () => existsSync('./.env') },
    {
      name: 'OPENAI_API_KEY variable',
      check: () => !!process.env.OPENAI_API_KEY,
    },
  ];

  let allGood = true;

  for (const { name, check } of checks) {
    if (check()) {
      consola.success(`✅ ${name}`);
    } else {
      consola.error(`❌ ${name}`);
      allGood = false;
    }
  }

  if (allGood) {
    consola.success('🎉 Everything is configured correctly!');
  } else {
    consola.warn('⚠️  Run: bun run setup');
  }
}

// Script to clean generated files
async function clean() {
  consola.info('🧹 Cleaning generated files...');

  try {
    const { readdir, unlink } = await import('fs/promises');

    if (existsSync('./output_flyers')) {
      const files = await readdir('./output_flyers');
      const imageFiles = files.filter(
        (f) => f.endsWith('.png') || f.endsWith('.jpg')
      );

      for (const file of imageFiles) {
        await unlink(`./output_flyers/${file}`);
      }

      consola.success(`🗑️  Deleted ${imageFiles.length} image files`);
    }
  } catch (error) {
    consola.error('❌ Error cleaning:', error);
  }
}

// Detect which action to execute based on arguments
const action = process.argv[2];

switch (action) {
  case 'verify':
    verify();
    break;
  case 'clean':
    clean();
    break;
  default:
    setup();
}

export { setup, verify, clean };
