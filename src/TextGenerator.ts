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
   * @param language - The language for text generation (default: 'English').
   * @returns A promise that resolves to an array of TextVariation objects.
   */
  async generateVariations(
    config: PromoConfig,
    quantity: number,
    language: string = 'English'
  ): Promise<TextVariation[]> {
    consola.info(
      `🤖 Requesting ${quantity} text variations from AI in ${language}...`
    );

    const prompt = this.buildPrompt(config, quantity, language);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Consider using 'gpt-4' or 'gpt-4-turbo-preview' for higher quality and reliability.
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(language),
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
      return this.generateFallbackVariations(config, quantity, language);
    }
  }

  /**
   * Gets the system prompt in the specified language.
   *
   * @param language - The target language for the system prompt.
   * @returns The system prompt string.
   */
  private getSystemPrompt(language: string): string {
    const systemPrompts: Record<string, string> = {
      English:
        'You are an expert in marketing and copywriting specialized in creating attractive, persuasive and concise promotional texts for various businesses. Your goal is to generate text variations strictly following JSON format instructions.',
      Spanish:
        'Eres un experto en marketing y copywriting especializado en crear textos promocionales atractivos, persuasivos y concisos para diversos negocios. Tu objetivo es generar variaciones de texto siguiendo estrictamente las instrucciones de formato JSON.',
      French:
        'Vous êtes un expert en marketing et rédaction spécialisé dans la création de textes promotionnels attrayants, persuasifs et concis pour diverses entreprises. Votre objectif est de générer des variations de texte en suivant strictement les instructions de format JSON.',
      German:
        'Sie sind ein Experte für Marketing und Copywriting, spezialisiert auf die Erstellung attraktiver, überzeugender und prägnanter Werbetexte für verschiedene Unternehmen. Ihr Ziel ist es, Textvariationen zu generieren, die strikt den JSON-Format-Anweisungen folgen.',
      Italian:
        'Sei un esperto di marketing e copywriting specializzato nella creazione di testi promozionali attraenti, persuasivi e concisi per varie aziende. Il tuo obiettivo è generare variazioni di testo seguendo rigorosamente le istruzioni del formato JSON.',
      Portuguese:
        'Você é um especialista em marketing e copywriting especializado em criar textos promocionais atraentes, persuasivos e concisos para diversos negócios. Seu objetivo é gerar variações de texto seguindo rigorosamente as instruções de formato JSON.',
    };

    return systemPrompts[language] ?? systemPrompts['English'] ?? '';
  }

  /**
   * Constructs the prompt for the OpenAI API call based on the promo configuration and language.
   *
   * @param config - The promotional configuration.
   * @param quantity - The number of text variations requested.
   * @param language - The target language for text generation.
   * @returns The constructed prompt string.
   */
  private buildPrompt(
    config: PromoConfig,
    quantity: number,
    language: string
  ): string {
    const prompts: Record<string, string> = {
      English: `
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
1. **"title"**: An impactful title (maximum 8 words).
2. **"subtitle"**: A subtitle that complements the title and adds value (maximum 15 words).
3. **"callToAction"**: A clear and direct call to action (maximum 5 words).
4. **"description"**: A brief and persuasive description that sells the product/offer (1-3 sentences).
5. **"tone"**: Describe the style or emotion of the variation (e.g.: "urgent", "elegant", "casual", "fun", "exclusive", "friendly", "informative", etc.).

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
  }
]
\`\`\`
Make sure the complete response is valid JSON and only contains the JSON array.`,

      Spanish: `
Necesito que generes ${quantity} variaciones de texto promocional para un negocio tipo "${
        config.businessType
      }" que vende/ofrece el producto/servicio "${config.product}".

Detalles clave del negocio y la oferta:
- Producto/Servicio Principal: "${config.product}"
- Oferta Específica: "${config.offer}"
- Validez/Vigencia de la Oferta: "${config.validity}"
- Ubicación (opcional): "${config.location ?? 'No especificada'}"
- Contacto Telefónico (opcional): "${config.phone ?? 'No especificado'}"
- Horario de Atención (opcional): "${config.schedule ?? 'No especificado'}"

Para cada una de las ${quantity} variaciones, incluye los siguientes campos y respeta las longitudes máximas indicadas:
1. **"title"**: Un título impactante (máximo 8 palabras).
2. **"subtitle"**: Un subtítulo que complemente el título y añada valor (máximo 15 palabras).
3. **"callToAction"**: Una llamada a la acción clara y directa (máximo 5 palabras).
4. **"description"**: Una descripción breve y persuasiva que venda el producto/oferta (1-3 oraciones).
5. **"tone"**: Describe el estilo o la emoción de la variación (ej: "urgente", "elegante", "casual", "divertido", "exclusivo", "amigable", "informativo", etc.).

Cada variación debe ser única en su enfoque, utilizando diferentes ángulos de venta, beneficios y tonos emocionales, pero siempre promocionando el mismo producto/oferta. Asegúrate de que las variaciones sean diversas.

El formato de la respuesta DEBE ser un arreglo JSON, como en el siguiente ejemplo:

\`\`\`json
[
  {
    "title": "¡Oferta Limitada!",
    "subtitle": "No dejes pasar esta oportunidad única de ahorro.",
    "callToAction": "¡Compra Ahora!",
    "description": "Disfruta de un descuento exclusivo en ${
      config.product
    }. ¡Válido solo por tiempo limitado!",
    "tone": "urgente"
  }
]
\`\`\`
Asegúrate de que la respuesta completa sea un JSON válido y solo contenga el arreglo JSON.`,
    };

    return prompts[language] ?? prompts['English'] ?? '';
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
   * @param language - The target language for fallback text.
   * @returns An array of TextVariation objects.
   */
  private generateFallbackVariations(
    config: PromoConfig,
    quantity: number,
    language: string = 'English'
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
        title: this.generateFallbackTitle(config, tone || '', language),
        subtitle: this.generateFallbackSubtitle(config, tone || '', language),
        callToAction: this.generateFallbackCTA(tone || '', language),
        description: this.generateFallbackDescription(
          config,
          tone || '',
          i,
          language
        ),
        tone: tone || '',
      });
    }

    // Ensure we don't return an empty array if quantity > 0 and no fallbacks could be made.
    if (fallbackVariations.length === 0 && quantity > 0) {
      const fallbackTexts = this.getFallbackTexts(language);
      return [
        {
          title: fallbackTexts.title.replace('{product}', config.product),
          subtitle: fallbackTexts.subtitle.replace('{product}', config.product),
          callToAction: fallbackTexts.callToAction,
          description: fallbackTexts.description.replace(
            '{product}',
            config.product
          ),
          tone: 'general',
        },
      ];
    }

    return fallbackVariations;
  }

  /**
   * Gets fallback texts in the specified language.
   */
  private getFallbackTexts(language: string) {
    const fallbackTexts: Record<string, any> = {
      English: {
        title: 'Special Offer for {product}!',
        subtitle: 'Discover more about our {product} today.',
        callToAction: 'Learn More!',
        description:
          'Take advantage of the opportunity to discover {product} with our special offer.',
      },
      Spanish: {
        title: '¡Oferta Especial de {product}!',
        subtitle: 'Descubre más sobre nuestro {product} hoy.',
        callToAction: '¡Infórmate!',
        description:
          'Aprovecha la oportunidad de conocer {product} con nuestra oferta especial.',
      },
    };

    return fallbackTexts[language] || fallbackTexts['English'];
  }

  // --- Fallback Text Generation Helpers ---
  // These helpers provide a basic, predefined set of responses when the AI fails.

  private generateFallbackTitle(
    config: PromoConfig,
    tone: string,
    language: string
  ): string {
    const titles: Record<string, Record<string, string>> = {
      English: {
        urgent: `Last Chance: ${config.offer}!`,
        elegant: `Exclusive ${config.product} for you`,
        casual: `Don't miss this ${config.product} deal!`,
        fun: `Party Time for ${config.product}!`,
        exclusive: `VIP Access to ${config.product}`,
        friendly: `Enjoy with family: ${config.product}`,
        informative: `Learn about ${config.product}: The Guide`,
        inspiring: `Transform your day with ${config.product}`,
      },
      Spanish: {
        urgent: `¡Última Oportunidad: ${config.offer}!`,
        elegant: `${config.product} Exclusivo para ti`,
        casual: `¡No te pierdas esta oferta de ${config.product}!`,
        fun: `¡Hora de ${config.product}!`,
        exclusive: `Acceso VIP a ${config.product}`,
        friendly: `Disfruta en familia: ${config.product}`,
        informative: `Conoce ${config.product}: La Guía`,
        inspiring: `Transforma tu día con ${config.product}`,
      },
    };

    const langTitles = titles[language] ?? titles['English'];
    return (langTitles?.[tone] ?? `Discover ${config.product} Now!`).substring(
      0,
      50
    );
  }

  private generateFallbackSubtitle(
    config: PromoConfig,
    tone: string,
    language: string
  ): string {
    const subtitles: Record<string, Record<string, string>> = {
      English: {
        urgent: `${config.validity}. Act fast!`,
        elegant: `Superior quality and unmatched design await you.`,
        casual: `Relax and enjoy ${config.product}.`,
        fun: `Fun is guaranteed with ${config.product}.`,
        exclusive: `Unique benefits designed for select customers.`,
        friendly: `Create unforgettable memories with your loved ones.`,
        informative: `Everything you need to know before your purchase.`,
        inspiring: `Achieve your goals with the support of ${config.product}.`,
      },
      Spanish: {
        urgent: `${config.validity}. ¡Actúa rápido!`,
        elegant: `Calidad superior y diseño inigualable te esperan.`,
        casual: `Relájate y disfruta de ${config.product}.`,
        fun: `La diversión está garantizada con ${config.product}.`,
        exclusive: `Beneficios únicos diseñados para clientes selectos.`,
        friendly: `Crea recuerdos inolvidables con los tuyos.`,
        informative: `Todo lo que necesitas saber antes de tu compra.`,
        inspiring: `Alcanza tus metas con el apoyo de ${config.product}.`,
      },
    };

    const langSubtitles = subtitles[language] || subtitles['English'];
    return (
      langSubtitles?.[tone] ||
      `Take advantage of our offer on ${config.product}.`
    ).substring(0, 80);
  }

  private generateFallbackCTA(tone: string, language: string): string {
    const ctas: Record<string, Record<string, string>> = {
      English: {
        urgent: 'Book Now!',
        elegant: 'Request Info',
        casual: 'Try It Now!',
        fun: 'Join the Party!',
        exclusive: 'Access Here!',
        friendly: 'Come With Us!',
        informative: 'Read More',
        inspiring: 'Start Today!',
      },
      Spanish: {
        urgent: '¡Reserva Ya!',
        elegant: 'Solicita Info',
        casual: '¡Pruébalo!',
        fun: '¡Únete!',
        exclusive: '¡Accede Aquí!',
        friendly: '¡Ven con Nosotros!',
        informative: 'Leer Más',
        inspiring: '¡Empieza Hoy!',
      },
    };

    const langCtas = ctas[language] || ctas['English'];
    return (langCtas?.[tone] || 'More Info!').substring(0, 30);
  }

  private generateFallbackDescription(
    config: PromoConfig,
    tone: string,
    index: number,
    language: string
  ): string {
    const descriptions: Record<string, Record<string, string>> = {
      English: {
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
      },
      Spanish: {
        urgent: `No dejes pasar esta oferta especial en ${
          config.product
        }. Válida solo hasta ${config.validity}. ¡Visítanos en ${
          config.location || 'nuestra tienda'
        }!`,
        elegant: `Sumérgete en la experiencia premium de ${config.product}. Diseño y funcionalidad se unen para ti.`,
        casual: `¿Buscas algo diferente? Nuestro ${config.product} es perfecto para tu día a día.`,
        fun: `Prepárate para la diversión con ${config.product}. ¡Ideal para cualquier ocasión!`,
        exclusive: `Una oportunidad única para acceder a lo mejor de ${config.product}. ¡Solo por invitación!`,
        friendly: `Momentos inolvidables te esperan con ${config.product}. Ideal para compartir en familia.`,
        informative: `Descubre las características clave y beneficios de ${config.product}.`,
        inspiring: `Da el siguiente paso hacia tus sueños con ${config.product}.`,
      },
    };

    const langDescriptions = descriptions[language] || descriptions['English'];
    const baseDescription =
      langDescriptions?.[tone] ||
      `Take advantage of our incredible ${config.offer} on ${config.product}. ${config.validity}. Visit us at ${config.location}.`;
    return baseDescription.substring(0, 200);
  }
}
