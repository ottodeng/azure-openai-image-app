// API Types and Interfaces for Azure OpenAI Image Generation

export const IMAGE_SIZES = {
  SQUARE: '1024x1024',
  PORTRAIT: '1024x1536',
  LANDSCAPE: '1536x1024'
};

export const IMAGE_QUALITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const OUTPUT_FORMATS = {
  PNG: 'png',
  JPEG: 'jpeg'
};

export const INPUT_FIDELITY_LEVELS = {
  LOW: 'low',
  HIGH: 'high'
};

// Default parameters for image generation
export const DEFAULT_GENERATION_PARAMS = {
  size: IMAGE_SIZES.SQUARE,
  quality: IMAGE_QUALITIES.HIGH,
  n: 1,
  output_format: OUTPUT_FORMATS.PNG,
  output_compression: 100
};

// Default parameters for image editing
export const DEFAULT_EDIT_PARAMS = {
  ...DEFAULT_GENERATION_PARAMS,
  input_fidelity: INPUT_FIDELITY_LEVELS.HIGH
};

// API Configuration
export const DEFAULT_CONFIG = {
  apiKey: '',
  endpoint: '',
  deploymentName: 'gpt-image-1',
  apiVersion: '2025-04-01-preview'
};

