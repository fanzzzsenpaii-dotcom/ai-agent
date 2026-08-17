export type AIMode = 'normal' | 'dark';
export type UITheme = 'dark' | 'light';
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  mode: AIMode;
  timestamp: number;
  isError?: boolean;
  animating?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: AIMode;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  uiTheme: UITheme;
  lastMode: AIMode;
  haptics: boolean;
  typewriter: boolean;
}
