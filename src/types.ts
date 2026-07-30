export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  displayContent?: string;
  model?: string;
  createdAt: number;
  streaming?: boolean;
  statusText?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  skillId: string;
  messages: Message[];
}

export interface Skill {
  id: string;
  label: string;
  icon: string;
  description: string;
  systemPrompt: string;
  promptStarters: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  isDefault?: boolean;
}

export interface TuningParams {
  temperature: number;
  maxTokens: number;
  context: string;
  constraints: string;
  outputFormat: string;
  customSystemPrompt: string | null;
}
