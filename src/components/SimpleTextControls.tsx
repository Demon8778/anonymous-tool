'use client';

import { useState } from 'react';

interface TextStyle {
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  fontWeight: 'normal' | 'bold';
}

interface SimpleTextControlsProps {
  style: TextStyle;
  onStyleChange: (updates: Partial<TextStyle>) => void;
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
];

export default function SimpleTextControls({ style, onStyleChange }: SimpleTextControlsProps) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);

  const handleColorChange = (color: string, type: 'color' | 'strokeColor') => {
    onStyleChange({ [type]: color });
  };

  const openColorPicker = (type: 'color' | 'strokeColor') => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = type === 'color' ? style.color : style.strokeColor;
    input.onchange = (e) => handleColorChange((e.target as HTMLInputElement).value, type);
    input.click();
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border">
      {/* Font Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Font Size: {style.fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="72"
          value={style.fontSize}
          onChange={(e) => onStyleChange({ fontSize: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Font Weight</label>
        <div className="flex gap-2">
          <button
            onClick={() => onStyleChange({ fontWeight: 'normal' })}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              style.fontWeight === 'normal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => onStyleChange({ fontWeight: 'bold' })}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              style.fontWeight === 'bold'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bold
          </button>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Text Color</label>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm"
            style={{ backgroundColor: style.color }}
            onClick={() => openColorPicker('color')}
          />
          <input
            type="text"
            value={style.color}
            onChange={(e) => handleColorChange(e.target.value, 'color')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            placeholder="#ffffff"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-110 ${
                style.color === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color, 'color')}
            />
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Stroke Color</label>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm"
            style={{ backgroundColor: style.strokeColor }}
            onClick={() => openColorPicker('strokeColor')}
          />
          <input
            type="text"
            value={style.strokeColor}
            onChange={(e) => handleColorChange(e.target.value, 'strokeColor')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            placeholder="#000000"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-110 ${
                style.strokeColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color, 'strokeColor')}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Stroke Width: {style.strokeWidth}px
        </label>
        <input
          type="range"
          min="0"
          max="8"
          step="0.5"
          value={style.strokeWidth}
          onChange={(e) => onStyleChange({ strokeWidth: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Opacity: {Math.round(style.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={style.opacity * 100}
          onChange={(e) => onStyleChange({ opacity: parseInt(e.target.value) / 100 })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}