export type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange' | 'purple';

export interface HighlightItem {
  id: string;
  url: string;
  cleanUrl: string;
  title: string;
  selectedText: string;
  prefix: string;
  suffix: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
  updatedAt: number;
  domXPath?: string;
  startOffset?: number;
  endOffset?: number;
}

export type MessageType = 
  | 'ADD_HIGHLIGHT'
  | 'REMOVE_HIGHLIGHT'
  | 'UPDATE_COLOR'
  | 'SAVE_NOTE'
  | 'DELETE_NOTE'
  | 'GET_PAGE_HIGHLIGHTS'
  | 'TOGGLE_ERASER'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA';

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}
