import React from 'react';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { IMAGE_SIZES, IMAGE_QUALITIES, OUTPUT_FORMATS, INPUT_FIDELITY_LEVELS } from '../types/api.js';

export function ParameterPanel({ params, onParamsChange, showEditParams = false }) {
  const updateParam = (key, value) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>参数设置</CardTitle>
        <CardDescription>
          调整图片生成{showEditParams ? '和编辑' : ''}参数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Size Selection */}
        <div className="space-y-2">
          <Label>图片尺寸</Label>
          <Select value={params.size} onValueChange={(value) => updateParam('size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择图片尺寸" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={IMAGE_SIZES.SQUARE}>1024x1024 (正方形)</SelectItem>
              <SelectItem value={IMAGE_SIZES.PORTRAIT}>1024x1536 (竖版)</SelectItem>
              <SelectItem value={IMAGE_SIZES.LANDSCAPE}>1536x1024 (横版)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quality Selection */}
        <div className="space-y-3">
          <Label>图片质量</Label>
          <RadioGroup 
            value={params.quality} 
            onValueChange={(value) => updateParam('quality', value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={IMAGE_QUALITIES.LOW} id="quality-low" />
              <Label htmlFor="quality-low">低质量 (快速生成)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={IMAGE_QUALITIES.MEDIUM} id="quality-medium" />
              <Label htmlFor="quality-medium">中等质量</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={IMAGE_QUALITIES.HIGH} id="quality-high" />
              <Label htmlFor="quality-high">高质量 (推荐)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Number of Images */}
        <div className="space-y-2">
          <Label htmlFor="number">生成数量 ({params.n})</Label>
          <Slider
            id="number"
            min={1}
            max={10}
            step={1}
            value={[params.n]}
            onValueChange={(value) => updateParam('n', value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        {/* Output Format */}
        <div className="space-y-3">
          <Label>输出格式</Label>
          <RadioGroup 
            value={params.output_format} 
            onValueChange={(value) => updateParam('output_format', value)}
            className="flex flex-row space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OUTPUT_FORMATS.png} id="format-png" />
              <Label htmlFor="format-png">png</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OUTPUT_FORMATS.jpeg} id="format-jpeg" />
              <Label htmlFor="format-jpeg">jpeg</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Output Compression */}
        <div className="space-y-2">
          <Label htmlFor="compression">压缩级别 ({params.output_compression}%)</Label>
          <Slider
            id="compression"
            min={0}
            max={100}
            step={5}
            value={[params.output_compression]}
            onValueChange={(value) => updateParam('output_compression', value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0% (无压缩)</span>
            <span>100% (最大压缩)</span>
          </div>
        </div>

        {/* Input Fidelity (Edit mode only) */}
        {showEditParams && (
          <div className="space-y-2">
            <Label>输入保真度</Label>
            <Select 
              value={params.input_fidelity} 
              onValueChange={(value) => updateParam('input_fidelity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择输入保真度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={INPUT_FIDELITY_LEVELS.LOW}>低 (更多创意变化)</SelectItem>
                <SelectItem value={INPUT_FIDELITY_LEVELS.MEDIUM}>中等 (平衡)</SelectItem>
                <SelectItem value={INPUT_FIDELITY_LEVELS.HIGH}>高 (保持原图特征)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Streaming */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="streaming">流式响应</Label>
            <div className="text-sm text-muted-foreground">
              启用后可以看到生成过程
            </div>
          </div>
          <Switch
            id="streaming"
            checked={params.stream}
            onCheckedChange={(checked) => updateParam('stream', checked)}
          />
        </div>

        {/* User ID (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="userId">用户ID (可选)</Label>
          <Input
            id="userId"
            placeholder="用于跟踪和监控"
            value={params.user || ''}
            onChange={(e) => updateParam('user', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ParameterPanel;

