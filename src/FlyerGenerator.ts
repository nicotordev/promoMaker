import { consola } from 'consola';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { TextGenerator } from './TextGenerator';
import { ImageGenerator } from './ImageGenerator';
import type {
  PromoConfig,
  GeneratedFlyer,
  CanvasConfig,
  TextVariation,
} from './types';

/**
 * Main class for generating promotional flyers.
 * Coordinates text generation with AI and image creation.
 */
export class FlyerGenerator {
  private textGenerator: TextGenerator;
  private imageGenerator: ImageGenerator;
  private outputDir: string;

  constructor() {
    this.textGenerator = new TextGenerator();
    this.imageGenerator = new ImageGenerator();
    // Set default output directory.
    this.outputDir = './output_flyers';
  }

  /**
   * Generates multiple flyer variations based on promotional configuration
   * and desired number of variations.
   *
   * @param config - Detailed promotional configuration (product, offer, colors, sizes).
   * @param quantity - Number of flyer variations to generate.
   * @returns A promise that resolves with an array of GeneratedFlyer objects.
   * @throws Error if text variations could not be generated.
   */
  async generateVariations(
    config: PromoConfig,
    quantity: number
  ): Promise<GeneratedFlyer[]> {
    consola.info(`🚀 Starting generation of ${quantity} promotional flyers.`);

    // Ensure output directory exists before starting.
    await this.ensureOutputDirectory();

    // Generate text variations using TextGenerator.
    const textVariations = await this.textGenerator.generateVariations(
      config,
      quantity
    );

    if (textVariations.length === 0) {
      throw new Error(
        '❌ Could not generate text variations. Flyer generation has been cancelled.'
      );
    }

    consola.success(
      `📝 Successfully generated ${textVariations.length} text variations.`
    );

    const flyers: GeneratedFlyer[] = [];

    // Iterate to generate each flyer. Ensures not exceeding available text variations.
    for (let i = 0; i < quantity; i++) {
      // Use modulo operator to cycle through texts and colors if 'quantity' is greater than variations/colors.
      const textVariation = textVariations[i % textVariations.length];
      const color = config.colors[i % config.colors.length] || '#3498DB';

      // Currently, only generates for Facebook.
      // Could be extended for an array of formats if desired as default behavior for single format.
      const format = 'facebook' as const;
      const dimensions = config.sizes[format];

      // Canvas configuration for the image.
      const canvasConfig: CanvasConfig = {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: color,
        textColor: this.imageGenerator.getContrastColor(color),
        accentColor: this.getAccentColor(color),
      };

      // Define filename and output path.
      const filename = `flyer_${i + 1}_${
        textVariation?.tone || 'generic'
      }_${format}.png`;
      const outputPath = join(this.outputDir, filename);

      try {
        // Generate flyer image.
        if (textVariation) {
          await this.imageGenerator.generateFlyer(
            textVariation,
            canvasConfig,
            outputPath
          );

          flyers.push({
            filename,
            textVariation,
            color,
            format,
          });
          consola.info(
            `✅ Flyer ${
              i + 1
            }/${quantity} (${format}) completed and saved to: ${outputPath}`
          );
        }
      } catch (imageError) {
        consola.error(
          `❌ Error generating flyer ${i + 1} for format ${format}:`,
          imageError
        );
        // Optional: could decide whether to throw error or continue with other flyers.
        // For now, just log error and continue.
      }
    }

    consola.success(`🎉 Generated ${flyers.length} flyers in total.`);
    return flyers;
  }

  /**
   * Generates flyers for all predefined social media formats (Facebook, Instagram, Story).
   *
   * @param config - Detailed promotional configuration.
   * @param quantity - Number of text variations to generate per format.
   * @returns A promise that resolves with an array of GeneratedFlyer objects for all formats.
   */
  async generateForAllFormats(
    config: PromoConfig,
    quantity: number
  ): Promise<GeneratedFlyer[]> {
    consola.info(`🚀 Starting flyer generation for ALL social media formats.`);

    await this.ensureOutputDirectory();

    const textVariations = await this.textGenerator.generateVariations(
      config,
      quantity
    );

    if (textVariations.length === 0) {
      throw new Error(
        '❌ Could not generate text variations. Generation for all formats has been cancelled.'
      );
    }

    consola.success(
      `📝 Generated ${textVariations.length} text variations for multiple formats.`
    );

    const flyers: GeneratedFlyer[] = [];
    // Define supported social media formats.
    const formats: Array<'facebook' | 'instagram' | 'story'> = [
      'facebook',
      'instagram',
      'story',
    ];

    for (let i = 0; i < quantity; i++) {
      const textVariation = textVariations[i % textVariations.length];
      const color = config.colors[i % config.colors.length] || '#3498DB';

      for (const format of formats) {
        const dimensions = config.sizes[format];

        const canvasConfig: CanvasConfig = {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: color,
          textColor: this.imageGenerator.getContrastColor(color),
          accentColor: this.getAccentColor(color),
        };

        const filename = `flyer_${i + 1}_${
          textVariation?.tone || 'generic'
        }_${format}.png`;
        const outputPath = join(this.outputDir, filename);

        try {
          if (textVariation) {
            await this.imageGenerator.generateFlyer(
              textVariation,
              canvasConfig,
              outputPath
            );

            flyers.push({
              filename,
              textVariation,
              color,
              format,
            });
            consola.info(
              `✅ Flyer ${
                i + 1
              }/${quantity} for ${format} completed and saved to: ${outputPath}`
            );
          }
        } catch (imageError) {
          consola.error(
            `❌ Error generating flyer ${i + 1} for format ${format}:`,
            imageError
          );
        }
      }
    }
    consola.success(
      `🎉 Generated ${flyers.length} flyers for all formats in total.`
    );
    return flyers;
  }

  /**
   * Generates a single flyer with specific text variation, color and format.
   * Useful for previews or custom generations.
   *
   * @param config - General promotional configuration.
   * @param textVariation - Specific text variation to use.
   * @param color - Background color for the flyer.
   * @param format - Flyer format ('facebook', 'instagram', 'story'). Defaults to 'facebook'.
   * @returns A promise that resolves with a GeneratedFlyer object of the created flyer.
   */
  async generateSingleFlyer(
    config: PromoConfig,
    textVariation: TextVariation,
    color: string = '#3498DB',
    format: 'facebook' | 'instagram' | 'story' = 'facebook'
  ): Promise<GeneratedFlyer> {
    consola.info(`✨ Generating a unique flyer for format: ${format}`);
    await this.ensureOutputDirectory();

    const dimensions = config.sizes[format];

    const canvasConfig: CanvasConfig = {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: color,
      textColor: this.imageGenerator.getContrastColor(color),
      accentColor: this.getAccentColor(color),
    };

    // Use timestamp to ensure unique filename for custom flyers.
    const timestamp = Date.now();
    const filename = `flyer_custom_${
      textVariation.tone || 'custom'
    }_${format}_${timestamp}.png`;
    const outputPath = join(this.outputDir, filename);

    try {
      await this.imageGenerator.generateFlyer(
        textVariation,
        canvasConfig,
        outputPath
      );
      consola.success(`✅ Unique flyer completed and saved to: ${outputPath}`);
    } catch (error) {
      consola.error(
        `❌ Error generating unique flyer for format ${format}:`,
        error
      );
      throw error; // Re-throw error to be handled by caller.
    }

    return {
      filename,
      textVariation,
      color,
      format,
    };
  }

  /**
   * Ensures output directory exists. Creates it if not present.
   *
   * @private
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await mkdir(this.outputDir, { recursive: true });
      consola.debug(`Output folder '${this.outputDir}' verified/created.`);
    } catch (error: any) {
      // If error is due to directory already existing, ignore it.
      // Otherwise, re-throw the error.
      if (error?.code !== 'EEXIST') {
        consola.error(
          `❌ Error creating output directory '${this.outputDir}':`,
          error
        );
        throw error;
      }
    }
  }

  /**
   * Calculates a complementary accent color based on a base color.
   * Attempts to provide adequate visual contrast.
   *
   * @private
   * @param baseColor - Base hexadecimal color (e.g. '#RRGGBB').
   * @returns Calculated accent color in hexadecimal format.
   */
  private getAccentColor(baseColor: string = '#3498DB'): string {
    // If base color is invalid or empty, return predefined color.
    if (!baseColor || !baseColor.startsWith('#') || baseColor.length !== 7) {
      return '#FFD700'; // Gold by default
    }

    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // If it's gray or pure black/white, provide a more vivid accent color.
    if (r === g && g === b) {
      return '#00BFFF'; // Sky blue
    }

    // Calculate simple complementary color by inverting and adjusting RGB components.
    const newR = (255 - r + 100) % 256;
    const newG = (255 - g + 100) % 256;
    const newB = (255 - b + 100) % 256;

    // Ensure values are within 0-255 range.
    const accentR = Math.min(255, Math.max(0, newR));
    const accentG = Math.min(255, Math.max(0, newG));
    const accentB = Math.min(255, Math.max(0, newB));

    return `#${accentR.toString(16).padStart(2, '0')}${accentG
      .toString(16)
      .padStart(2, '0')}${accentB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Convenience method to quickly generate flyer variations
   * with basic configuration. Useful for testing or simple use cases.
   *
   * @param product - Product or service name.
   * @param offer - Offer or promotion description.
   * @param colors - Array of hexadecimal colors to use in flyers.
   * @param quantity - Number of flyer variations to generate.
   * @returns A promise that resolves with an array of GeneratedFlyer objects.
   */
  async generateCustomVariations(
    product: string,
    offer: string,
    colors: string[] = ['#3498DB', '#E74C3C', '#2ECC71'],
    quantity: number
  ): Promise<GeneratedFlyer[]> {
    consola.info(
      `🛠️ Generating custom variations for '${product}' with offer '${offer}'.`
    );

    // Basic configuration for quick use.
    const quickConfig: PromoConfig = {
      product,
      businessType: 'local business', // Generic business type
      offer,
      validity: 'Limited time offer',
      location: 'Visit our store!',
      phone: 'Call us at (555) 123-4567',
      schedule: 'Open Monday to Saturday',
      colors,
      sizes: {
        facebook: { width: 1200, height: 630 },
        instagram: { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 },
      },
    };

    // Reuse main method for generation.
    return this.generateVariations(quickConfig, quantity);
  }
}
