import { ModelOption } from '../types';

export const MODELS: ModelOption[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tag: 'Recommended',
    description: 'Fast, intelligent model for general coding, writing & reasoning',
    isDefault: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    tag: 'Advanced',
    description: 'Deep reasoning for complex code, architecture & STEM tasks',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Ultra Fast',
    description: 'Minimal latency for quick questions & simple text tasks',
  },
];

export function getModelById(id: string): ModelOption {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}
