'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  scaleFactor?: number;
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#22c55e', '#3b82f6',
  '#eab308', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6',
];

export default function SimpleTextControls({ style, onStyleChange, scaleFactor = 1 }: SimpleTextControlsProps) {

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
    <div className="space-y-6">
      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Font Size</Label>
          <Badge variant="secondary" className="text-xs">
            {style.fontSize}px
            {scaleFactor !== 1 && (
              <span className="ml-1 text-muted-foreground">
                ({Math.round(style.fontSize * scaleFactor)}px)
              </span>
            )}
          </Badge>
        </div>
        <Slider
          value={[style.fontSize]}
          onValueChange={(values) => onStyleChange({ fontSize: values[0] })}
          min={12}
          max={72}
          step={1}
          className="w-full"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Font Weight</Label>
        <div className="flex gap-2">
          <Button
            onClick={() => onStyleChange({ fontWeight: 'normal' })}
            variant={style.fontWeight === 'normal' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            Normal
          </Button>
          <Button
            onClick={() => onStyleChange({ fontWeight: 'bold' })}
            variant={style.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            Bold
          </Button>
        </div>
      </div>

      <Separator />

      {/* Text Color */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <Label className="text-sm font-medium">Text Color</Label>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md border-2 border-border cursor-pointer shadow-sm"
            style={{ backgroundColor: style.color }}
            onClick={() => openColorPicker('color')}
          />
          <Input
            type="text"
            value={style.color}
            onChange={(e) => handleColorChange(e.target.value, 'color')}
            className="flex-1 font-mono text-sm"
            placeholder="#ffffff"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-110 ${
                style.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color, 'color')}
            />
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Stroke Color</Label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md border-2 border-border cursor-pointer shadow-sm"
            style={{ backgroundColor: style.strokeColor }}
            onClick={() => openColorPicker('strokeColor')}
          />
          <Input
            type="text"
            value={style.strokeColor}
            onChange={(e) => handleColorChange(e.target.value, 'strokeColor')}
            className="flex-1 font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-110 ${
                style.strokeColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color, 'strokeColor')}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Stroke Width</Label>
          <Badge variant="secondary" className="text-xs">
            {style.strokeWidth}px
          </Badge>
        </div>
        <Slider
          value={[style.strokeWidth]}
          onValueChange={(values) => onStyleChange({ strokeWidth: values[0] })}
          min={0}
          max={8}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Opacity</Label>
          <Badge variant="secondary" className="text-xs">
            {Math.round(style.opacity * 100)}%
          </Badge>
        </div>
        <Slider
          value={[style.opacity * 100]}
          onValueChange={(values) => onStyleChange({ opacity: values[0] / 100 })}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
}