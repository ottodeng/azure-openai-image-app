import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';
import AzureOpenAIService from '../services/azureOpenAI.js';
import ParameterPanel from './ParameterPanel.jsx';
import ImageGallery from './ImageGallery.jsx';
import { LoadingOverlay } from './LoadingOverlay.jsx';

export function ImageGeneration() {
  const { state, actions } = useApp();
  const [prompt, setPrompt] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const isConfigValid = state.config.apiKey && state.config.endpoint && state.config.deploymentName;

  const handleGenerate = async () => {
    console.log('Generate button clicked');
    
    if (!prompt.trim()) {
      actions.setGenerationError('请输入图片描述');
      return;
    }

    if (!isConfigValid) {
      actions.setGenerationError('请先配置 Azure OpenAI 服务');
      return;
    }

    try {
      console.log('Setting loading to true');
      // 同时设置全局和本地loading状态
      setLocalLoading(true);
      flushSync(() => {
        actions.setGenerationLoading(true);
        actions.setGenerationError(null);
      });

      // 添加一个短暂的延迟，确保UI有时间更新
      await new Promise(resolve => setTimeout(resolve, 100));

      const service = new AzureOpenAIService(state.config);
      const response = await service.generateImages({
        prompt: prompt.trim(),
        ...state.generation.params
      });

      actions.setGenerationResults(response.images);
      actions.addToGallery(response.images.map(img => ({
        ...img,
        type: 'generation',
        prompt: prompt.trim(),
        timestamp: new Date().toISOString()
      })));

    } catch (error) {
      console.log('Error during generation:', error);
      actions.setGenerationError(error.message);
    } finally {
      console.log('Setting loading to false');
      setLocalLoading(false);
      actions.setGenerationLoading(false);
    }
  };

  const handleClearResults = () => {
    actions.setGenerationResults([]);
    actions.setGenerationError(null);
  };

  console.log('ImageGeneration render, loading state:', state.generation.loading, 'localLoading:', localLoading);

  return (
    <>
      {/* Loading Overlay - 检查两个loading状态 */}
      <LoadingOverlay 
        isVisible={state.generation.loading || localLoading}
        message="正在生成图片"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel - Input and Parameters */}
      <div className="space-y-6">
        {/* Prompt Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              图片生成
            </CardTitle>
            <CardDescription>
              描述您想要生成的图片内容和风格
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">图片描述</Label>
              <Textarea
                id="prompt"
                placeholder="例如：一只可爱的橙色小猫坐在阳光明媚的窗台上，水彩画风格"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Error Display */}
            {state.generation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.generation.error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={state.generation.loading || localLoading || !prompt.trim() || !isConfigValid}
                className="flex-1"
              >
                {(state.generation.loading || localLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    生成图片
                  </>
                )}
              </Button>
              
              {state.generation.results.length > 0 && (
                <Button variant="outline" onClick={handleClearResults}>
                  清除结果
                </Button>
              )}
            </div>

            {!isConfigValid && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  请先在右上角配置 Azure OpenAI 服务连接信息
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Parameter Panel */}
        <ParameterPanel
          params={state.generation.params}
          onParamsChange={actions.setGenerationParams}
          showEditParams={false}
        />
      </div>

      {/* Right Panel - Results */}
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>
              {state.generation.results.length > 0 
                ? `共生成 ${state.generation.results.length} 张图片`
                : '生成的图片将在这里显示'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            {state.generation.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">正在生成图片...</p>
                </div>
              </div>
            ) : state.generation.results.length > 0 ? (
              <ImageGallery images={state.generation.results} />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>输入描述并点击生成按钮开始创作</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

export default ImageGeneration;

