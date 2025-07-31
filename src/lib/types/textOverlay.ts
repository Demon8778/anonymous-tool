/**
 * Text overlay types and interfaces
 */

export interface TextOverlay {
  id: string;
  text: string;
  position: Position;
  style: TextStyle;
  animation?: TextAnimation;
  isDragging: boolean;
}

export interface Position {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface TextAnimation {
  type: 'none' | 'fade' | 'slide' | 'bounce';
  duration: number;
  delay: number;
}

// Default text style configuration
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 24,
  fontFamily: 'Arial',
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2,
  opacity: 1,
  fontWeight: 'bold',
  textAlign: 'center',
};

// Default text animation configuration
export const DEFAULT_TEXT_ANIMATION: TextAnimation = {
  type: 'none',
  duration: 1000,
  delay: 0,
};