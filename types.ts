export interface SummaryState {
  isLoading: boolean;
  error: string | null;
  content: string;
  isStreaming: boolean;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export enum TabOption {
  TEXT = 'TEXT',
  FILE = 'FILE',
  LINK = 'LINK'
}