export interface PromoConfig {
  product: string;
  businessType: string;
  offer: string;
  validity: string;
  location: string;
  phone: string;
  schedule: string;
  colors: string[];
  sizes: {
    facebook: { width: number; height: number };
    instagram: { width: number; height: number };
    story: { width: number; height: number };
  };
}

export interface TextVariation {
  title: string;
  subtitle: string;
  callToAction: string;
  description: string;
  tone: string;
}

export interface GeneratedFlyer {
  filename: string;
  textVariation: TextVariation;
  color: string;
  format: 'facebook' | 'instagram' | 'story';
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}
