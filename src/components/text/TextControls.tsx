/**
 * TextControls component with shadcn color picker and typography controls
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Minus,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import type { TextStyle } from '@/lib/types/textOverlay';
import { cn } from '@/lib/utils';

interface TextControlsProps {
  style: TextStyle;
  onStyleChange: (updates: Partial<TextStyle>) => void;
  className?: string;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080',
];

export function TextControls({ style, onStyleChange, className }: TextControlsProps) {
  const handleColorChange = (color: string, type: 'color' | 'strokeColor') => {
    onStyleChange({ [type]: color });
  };

  const handleFontSizeChange = (values: number[]) => {
    onStyleChange({ fontSize: values[0] });
  };

  const handleStrokeWidthChange = (values: number[]) => {
    onStyleChange({ strokeWidth: values[0] });
  };

  const handleOpacityChange = (values: number[]) => {
    onStyleChange({ opacity: values[0] / 100 });
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Type className="w-5 h-5" />
          Text Style
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Font Family</Label>
          <Select value={style.fontFamily} onValueChange={(value) => onStyleChange({ fontFamily: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Font Size</Label>
            <Badge variant="secondary" className="text-xs">
              {style.fontSize}px
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onStyleChange({ fontSize: Math.max(8, style.fontSize - 2) })}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Slider
              value={[style.fontSize]}
              onValueChange={handleFontSizeChange}
              min={8}
              max={72}
              step={1}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onStyleChange({ fontSize: Math.min(72, style.fontSize + 2) })}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Font Weight & Alignment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Weight</Label>
            <Select value={style.fontWeight} onValueChange={(value: 'normal' | 'bold') => onStyleChange({ fontWeight: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alignment</Label>
            <div className="flex rounded-md border">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <Button
                  key={value}
                  variant={style.textAlign === value ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 rounded-none first:rounded-l-md last:rounded-r-md"
                  onClick={() => onStyleChange({ textAlign: value as 'left' | 'center' | 'right' })}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Text Color */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <Label className="text-sm font-medium">Text Color</Label>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: style.color }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = style.color;
                  input.onchange = (e) => handleColorChange((e.target as HTMLInputElement).value, 'color');
                  input.click();
                }}
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
                  className={cn(
                    'w-8 h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-110',
                    style.color === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color, 'color')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stroke Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Stroke Color</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: style.strokeColor }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = style.strokeColor;
                  input.onchange = (e) => handleColorChange((e.target as HTMLInputElement).value, 'strokeColor');
                  input.click();
                }}
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
                  className={cn(
                    'w-8 h-8 rounded-md border-2 cursor-pointer transition-all hover:scale-110',
                    style.strokeColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color, 'strokeColor')}
                />
              ))}
            </div>
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
            onValueChange={handleStrokeWidthChange}
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              {style.opacity < 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Opacity
            </Label>
            <Badge variant="secondary" className="text-xs">
              {Math.round(style.opacity * 100)}%
            </Badge>
          </div>
          <Slider
            value={[style.opacity * 100]}
            onValueChange={handleOpacityChange}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Gradient background for visual polish */}
        <div 
          className="absolute inset-0 -z-10 rounded-lg opacity-5"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          }}
        />
      </CardContent>
    </Card>
  );
}