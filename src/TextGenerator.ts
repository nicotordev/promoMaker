import OpenAI from 'openai';
import { consola } from 'consola';
import type { PromoConfig, TextVariation } from './types';

export class TextGenerator {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // It's good practice to throw a specific error type for better error handling upstream.
      throw new Error(
        '❌ Configuration error: OPENAI_API_KEY environment variable is not defined.'
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Generates multiple text variations for a promotional campaign using OpenAI's GPT model.
   * Includes robust error handling and a fallback mechanism.
   *
   * @param config - The promotional configuration.
   * @param quantity - The number of text variations to generate.
   * @returns A promise that resolves to an array of TextVariation objects.
   */
  async generateVariations(
    config: PromoConfig,
    quantity: number
  ): Promise<TextVariation[]> {
    consola.info(`🤖 Requesting ${quantity} text variations from AI...`);

    const prompt = this.buildPrompt(config, quantity);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Consider using 'gpt-4' or 'gpt-4-turbo-preview' for higher quality and reliability.
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in marketing and copywriting specialized in creating attractive, persuasive and concise promotional texts for various businesses. Your goal is to generate text variations strictly following JSON format instructions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8, // A good balance between creativity and consistency.
        max_tokens: 2000, // Sufficient tokens for multiple variations.
        response_format: { type: 'json_object' }, // Explicitly request JSON format.
      });

      const responseContent = completion.choices[0]?.message?.content;

      if (!responseContent) {
        throw new Error('AI did not return content in the response.');
      }

      // Since we requested 'json_object', the response should ideally be directly parseable.
      return this.parseResponse(responseContent);
    } catch (error) {
      consola.error('❌ Error generating text with AI:', error);
      // Fallback: generate basic variations if AI fails or response is invalid.
      return this.generateFallbackVariations(config, quantity);
    }
  }

  /**
   * Constructs the prompt for the OpenAI API call based on the promo configuration.
   *
   * @param config - The promotional configuration.
   * @param quantity - The number of text variations requested.
   * @returns The constructed prompt string.
   */
  private buildPrompt(config: PromoConfig, quantity: number): string {
    // Emphasize JSON format and constraints more clearly in the prompt.
    return `
I need you to generate ${quantity} promotional text variations for a "${
      config.businessType
    }" business that sells/offers the product/service "${config.product}".

Key business and offer details:
- Main Product/Service: "${config.product}"
- Specific Offer: "${config.offer}"
- Validity/Duration of Offer: "${config.validity}"
- Location (optional): "${config.location || 'Not specified'}"
- Phone Contact (optional): "${config.phone || 'Not specified'}"
- Business Hours (optional): "${config.schedule || 'Not specified'}"

For each of the ${quantity} variations, include the following fields and respect the maximum lengths indicated:
1.  **"title"**: An impactful title (maximum 8 words).
2.  **"subtitle"**: A subtitle that complements the title and adds value (maximum 15 words).
3.  **"callToAction"**: A clear and direct call to action (maximum 5 words).
4.  **"description"**: A brief and persuasive description that sells the product/offer (1-3 sentences).
5.  **"tone"**: Describe the style or emotion of the variation (e.g.: "urgent", "elegant", "casual", "fun", "exclusive", "friendly", "informative", etc.).

Each variation should be unique in its approach, using different sales angles, benefits and emotional tones, but always promoting the same product/offer. Make sure the variations are diverse.

The response format MUST be a JSON array, like in the following example:

\`\`\`json
[
  {
    "title": "Limited Offer!",
    "subtitle": "Don't miss this unique savings opportunity.",
    "callToAction": "Buy Now!",
    "description": "Enjoy an exclusive discount on ${
      config.product
    }. Valid for limited time only!",
    "tone": "urgent"
  },
  {
    "title": "Discover Excellence",
    "subtitle": "${config.product} with the quality you deserve.",
    "callToAction": "Explore More",
    "description": "Experience luxury and perfection in every detail of our ${
      config.product
    }. Ideal for those seeking the best.",
    "tone": "elegant"
  }
]
\`\`\`
Make sure the complete response is valid JSON and only contains the JSON array.
`;
  }

  /**
   * Parses the JSON response from the OpenAI API.
   * Includes error handling for invalid JSON.
   *
   * @param response - The raw string response from the AI.
   * @returns An array of parsed TextVariation objects.
   */
  private parseResponse(response: string): TextVariation[] {
    try {
      // If `response_format: { type: 'json_object' }` is used, the response should be clean JSON.
      const variations: TextVariation[] = JSON.parse(response);

      // Basic validation to ensure the parsed objects have essential fields.
      return variations.filter(
        (v) =>
          typeof v === 'object' &&
          v !== null &&
          'title' in v &&
          'subtitle' in v &&
          'callToAction' in v &&
          'description' in v &&
          'tone' in v
      );
    } catch (error) {
      consola.warn(
        '⚠️ Error parsing AI JSON response. The format may not be as expected.',
        error
      );
      // If parsing fails, it's better to return an empty array or re-throw after logging.
      // The calling function will then trigger the fallback if it's caught there.
      throw new Error('Invalid JSON response format received from AI.');
    }
  }

  /**
   * Generates a set of basic, pre-defined text variations as a fallback.
   * This is crucial when the AI fails to generate or returns an unparseable response.
   *
   * @param config - The promotional configuration.
   * @param quantity - The number of fallback variations to generate.
   * @returns An array of TextVariation objects.
   */
  private generateFallbackVariations(
    config: PromoConfig,
    quantity: number
  ): TextVariation[] {
    consola.info('🔄 Generating fallback variations due to an error...');

    const baseTones = [
      'urgent',
      'elegant',
      'casual',
      'fun',
      'exclusive',
      'friendly',
      'informative',
      'inspiring',
    ];
    const fallbackVariations: TextVariation[] = [];

    for (let i = 0; i < quantity; i++) {
      const tone = baseTones[i % baseTones.length];
      fallbackVariations.push({
        title: this.generateFallbackTitle(config, tone || ''),
        subtitle: this.generateFallbackSubtitle(config, tone || ''),
        callToAction: this.generateFallbackCTA(tone || ''),
        description: this.generateFallbackDescription(config, tone || '', i),
        tone: tone || '',
      });
    }

    // Ensure we don't return an empty array if quantity > 0 and no fallbacks could be made.
    if (fallbackVariations.length === 0 && quantity > 0) {
      return [
        {
          title: `Special Offer for ${config.product}!`,
          subtitle: `Discover more about our ${config.product} today.`,
          callToAction: 'Learn More!',
          description: `Take advantage of the opportunity to discover ${config.product} with our special offer.`,
          tone: 'general',
        },
      ];
    }

    return fallbackVariations;
  }

  // --- Fallback Text Generation Helpers ---
  // These helpers provide a basic, predefined set of responses when the AI fails.

  private generateFallbackTitle(config: PromoConfig, tone: string): string {
    const titles: Record<string, string> = {
      urgent: `Last Chance: ${config.offer}!`,
      elegant: `Exclusive ${config.product} for you`,
      casual: `Don't miss this ${config.product} deal!`,
      fun: `🎉 Time for ${config.product}!`,
      exclusive: `VIP Access to ${config.product}`,
      friendly: `Enjoy with family: ${config.product}`,
      informative: `Learn about ${config.product}: The Guide`,
      inspiring: `Transform your day with ${config.product}`,
    };
    return (titles[tone] || `Discover ${config.product} Now!`).substring(0, 50); // Cap title length
  }

  private generateFallbackSubtitle(config: PromoConfig, tone: string): string {
    const subtitles: Record<string, string> = {
      urgent: `${config.validity}. Act fast!`,
      elegant: `Superior quality and unmatched design await you.`,
      casual: `Relax and enjoy ${config.product}.`,
      fun: `Fun is guaranteed with ${config.product}.`,
      exclusive: `Unique benefits designed for select customers.`,
      friendly: `Create unforgettable memories with your loved ones.`,
      informative: `Everything you need to know before your purchase.`,
      inspiring: `Achieve your goals with the support of ${config.product}.`,
    };
    return (
      subtitles[tone] || `Take advantage of our offer on ${config.product}.`
    ).substring(0, 80); // Cap subtitle length
  }

  private generateFallbackCTA(tone: string): string {
    const ctas: Record<string, string> = {
      urgent: 'Book Now!',
      elegant: 'Request Info',
      casual: 'Try It Now!',
      fun: 'Join the Party!',
      exclusive: 'Access Here!',
      friendly: 'Come With Us!',
      informative: 'Read More',
      inspiring: 'Start Today!',
    };
    return (ctas[tone] || 'More Info!').substring(0, 30); // Cap CTA length
  }

  private generateFallbackDescription(
    config: PromoConfig,
    tone: string,
    index: number
  ): string {
    const descriptions: Record<string, string> = {
      urgent: `Don't miss this special offer on ${
        config.product
      }. Valid only until ${config.validity}. Visit us at ${
        config.location || 'our store'
      }!`,
      elegant: `Immerse yourself in the premium experience of ${config.product}. Design and functionality come together for you.`,
      casual: `Looking for something different? Our ${config.product} is perfect for your daily life.`,
      fun: `Get ready for fun with ${config.product}. Ideal for any occasion!`,
      exclusive: `A unique opportunity to access the best of ${config.product}. By invitation only!`,
      friendly: `Unforgettable moments await you with ${config.product}. Ideal for sharing with family.`,
      informative: `Discover the key features and benefits of ${config.product}.`,
      inspiring: `Take the next step towards your dreams with ${config.product}.`,
    };
    const baseDescription =
      descriptions[tone] ||
      `Take advantage of our incredible ${config.offer} on ${config.product}. ${config.validity}. Visit us at ${config.location}.`;
    return baseDescription.substring(0, 200); // Cap description length
  }
}
