# 🎨 PromoMaker - AI-Powered Promotional Flyer Generator

PromoMaker is a tool that automatically generates multiple variations of promotional flyers using artificial intelligence. It creates different texts, colors and designs to promote the same product or service.

## ✨ Features

- 🤖 **AI Text Generation**: Uses OpenAI GPT to create promotional text variations
- 🎨 **Multiple Colors**: Generates flyers with different color schemes
- 📱 **Optimized Formats**: Facebook, Instagram and Stories
- 📝 **Different Tones**: Urgent, elegant, casual, fun, etc.
- 🖼️ **SVG/PNG Images**: Generates high-quality images using Sharp
- ⚡ **Quick Mode**: Simplified method for express generation

## 🚀 Installation

```bash
# Clone the repository
git clone <your-repo>
cd promomaker

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## 🔑 Configuration

1. Get an API Key from OpenAI at [platform.openai.com](https://platform.openai.com/api-keys)
2. Create a `.env` file with your configuration:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 🎯 Basic Usage

### Main Method

```typescript
import { FlyerGenerator } from './src/FlyerGenerator';

const generator = new FlyerGenerator();

const config = {
  product: 'Special Italian Pizza',
  businessType: 'restaurant',
  offer: '50% discount',
  validity: 'Only this weekend',
  location: 'Downtown',
  phone: '+1 234 567 890',
  schedule: 'Open from 11:00 AM to 11:00 PM',
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
  sizes: {
    facebook: { width: 1200, height: 630 },
    instagram: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
  },
};

// Generate 6 variations
const flyers = await generator.generateVariations(config, 6);
```

### Quick Method

```typescript
// For express generation
const flyers = await generator.generateCustomVariations(
  'Gourmet Burgers', // product
  '30% discount', // offer
  ['#E74C3C', '#3498DB'], // colors
  4 // quantity
);
```

## 📋 Examples

```bash
# Run basic example
bun run example

# Run advanced examples
bun run advanced-examples

# Run the main project
bun run start
```

## 📂 Project Structure

```
promomaker/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── TextGenerator.ts   # AI text generation
│   ├── ImageGenerator.ts  # Image generation
│   └── FlyerGenerator.ts  # Main coordinator
├── output_flyers/         # Generated flyers
├── index.ts              # Main entry point
├── example.ts            # Usage examples
├── advanced-examples.ts  # Business-specific examples
└── README.md
```

## 🎨 Types of Generated Flyers

The system generates flyers with:

- **Impactful titles** (maximum 8 words)
- **Complementary subtitles** (maximum 12 words)
- **Specific calls to action** (maximum 4 words)
- **Attractive descriptions** (1-2 sentences)
- **Different emotional tones**: urgent, elegant, casual, fun, exclusive, friendly

## 🌈 Supported Formats

- **Facebook**: 1200x630px (optimal for posts)
- **Instagram**: 1080x1080px (square)
- **Instagram Stories**: 1080x1920px (vertical)

## 🛠️ API Reference

### FlyerGenerator

#### `generateVariations(config, quantity)`

Generates multiple variations for Facebook.

#### `generateForAllFormats(config, quantity)`

Generates variations for all formats (Facebook, Instagram, Stories).

#### `generateCustomVariations(product, offer, colors, quantity)`

Quick method for express generation.

#### `generateSingleFlyer(config, textVariation, color, format)`

Generates an individual flyer with specific parameters.

### TextGenerator

#### `generateVariations(config, quantity)`

Generates text variations using OpenAI GPT.

### ImageGenerator

#### `generateFlyer(textVariation, canvasConfig, outputPath)`

Generates the flyer image in PNG format.

## 🎯 Use Cases

- **Restaurants**: Food promotions, special menus
- **Stores**: Offers, clearances, new products
- **Services**: Service promotions, temporary discounts
- **Events**: Event announcements, parties, celebrations
- **Real Estate**: Properties on offer, special promotions

## 🔧 Customization

### Colors

You can use any color in hexadecimal format:

```typescript
colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
```

### Text Tones

The system automatically generates different tones:

- `urgent`: "Limited offer!"
- `elegant`: "Exceptional quality"
- `casual`: "Hey, check this out"
- `fun`: "Fun guaranteed!"
- `exclusive`: "VIP only"
- `friendly`: "For the whole family"

## 🛠️ Available Scripts

- `bun run start` - Main application
- `bun run example` - Basic examples
- `bun run advanced-examples` - Advanced business examples
- `bun run setup` - Initial configuration
- `bun run verify` - Configuration verification
- `bun run clean` - Clean generated files

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license. See the `LICENSE` file for more details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for the GPT API
- [Sharp](https://sharp.pixelplumbing.com/) for image processing
- [Bun](https://bun.sh) for the JavaScript runtime

---

**Create amazing promotional flyers in seconds! 🚀**
