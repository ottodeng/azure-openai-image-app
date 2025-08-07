import React, { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Loader2, Edit3, Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';
import AzureOpenAIService from '../services/azureOpenAI.js';
import ParameterPanel from './ParameterPanel.jsx';
import ImageGallery from './ImageGallery.jsx';
import { LoadingOverlay } from './LoadingOverlay.jsx';

export function ImageEdit() {
  const { state, actions } = useApp();
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [mask, setMask] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const isConfigValid = state.config.apiKey && state.config.endpoint && state.config.deploymentName;

  // Image dropzone
  const onImageDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg';
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== acceptedFiles.length) {
      actions.setEditError('只支持 png 和 jpeg 格式，且文件大小不超过 50MB');
    }

    setImages(prev => [...prev, ...validFiles]);
  }, [actions]);

  // Mask dropzone
  const onMaskDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'image/png') {
        setMask(file);
      } else {
        actions.setEditError('蒙版文件必须是 PNG 格式');
      }
    }
  }, [actions]);

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: true
  });

  const maskDropzone = useDropzone({
    onDrop: onMaskDrop,
    accept: {
      'image/png': ['.png']
    },
    multiple: false
  });

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMask = () => {
    setMask(null);
  };

  const handleEdit = async () => {
    console.log('Edit button clicked');
    
    if (!prompt.trim()) {
      actions.setEditError('请输入编辑描述');
      return;
    }

    if (images.length === 0) {
      actions.setEditError('请上传至少一张图片');
      return;
    }

    if (!isConfigValid) {
      actions.setEditError('请先配置 Azure OpenAI 服务');
      return;
    }

    try {
      console.log('Setting edit loading to true');
      // 同时设置全局和本地loading状态
      setLocalLoading(true);
      flushSync(() => {
        actions.setEditLoading(true);
        actions.setEditError(null);
      });

      // 添加一个短暂的延迟，确保UI有时间更新
      await new Promise(resolve => setTimeout(resolve, 100));

      const service = new AzureOpenAIService(state.config);
      const response = await service.editImages({
        prompt: prompt.trim(),
        images: images,
        mask: mask,
        ...state.editing.params
      });

      actions.setEditResults(response.images);
      actions.addToGallery(response.images.map(img => ({
        ...img,
        type: 'edit',
        prompt: prompt.trim(),
        timestamp: new Date().toISOString()
      })));

    } catch (error) {
      console.log('Error during editing:', error);
      actions.setEditError(error.message);
    } finally {
      console.log('Setting edit loading to false');
      setLocalLoading(false);
      actions.setEditLoading(false);
    }
  };

  const handleClearResults = () => {
    actions.setEditResults([]);
    actions.setEditError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  console.log('ImageEdit render, loading state:', state.editing.loading, 'localLoading:', localLoading);

  return (
    <>
      {/* Loading Overlay - 检查两个loading状态 */}
      <LoadingOverlay 
        isVisible={state.editing.loading || localLoading}
        message="正在编辑图片"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel - Input and Parameters */}
      <div className="space-y-6">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              图片编辑
            </CardTitle>
            <CardDescription>
              上传图片并描述您想要的修改
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Area */}
            <div className="space-y-2">
              <Label>上传图片 (支持多张)</Label>
              <div
                {...imageDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  imageDropzone.isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...imageDropzone.getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  拖拽图片到这里，或点击选择文件
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 PNG、JPEG 格式，最大 50MB
                </p>
              </div>
            </div>

            {/* Uploaded Images */}
            {images.length > 0 && (
              <div className="space-y-2">
                <Label>已上传的图片 ({images.length})</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {images.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm truncate">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mask Upload */}
            <div className="space-y-2">
              <Label>蒙版 (可选)</Label>
              <div
                {...maskDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  maskDropzone.isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...maskDropzone.getInputProps()} />
                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  上传 PNG 蒙版文件 (可选)
                </p>
              </div>
            </div>

            {/* Uploaded Mask */}
            {mask && (
              <div className="space-y-2">
                <Label>蒙版文件</Label>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm truncate">{mask.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(mask.size)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeMask}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Prompt */}
            <div className="space-y-2">
              <Label htmlFor="editPrompt">编辑描述</Label>
              <Textarea
                id="editPrompt"
                placeholder="例如：在图片中央添加一个红色的气球"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Error Display */}
            {state.editing.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.editing.error}</AlertDescription>
              </Alert>
            )}

            {/* Edit Button */}
            <div className="flex gap-2">
              <Button 
                onClick={handleEdit} 
                disabled={state.editing.loading || localLoading || !prompt.trim() || images.length === 0 || !isConfigValid}
                className="flex-1"
              >
                {(state.editing.loading || localLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    编辑中...
                  </>
                ) : (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    编辑图片
                  </>
                )}
              </Button>
              
              {state.editing.results.length > 0 && (
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
          params={state.editing.params}
          onParamsChange={actions.setEditParams}
          showEditParams={true}
        />
      </div>

      {/* Right Panel - Results */}
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>编辑结果</CardTitle>
            <CardDescription>
              {state.editing.results.length > 0 
                ? `共生成 ${state.editing.results.length} 张编辑后的图片`
                : '编辑后的图片将在这里显示'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            {state.editing.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">正在编辑图片...</p>
                </div>
              </div>
            ) : state.editing.results.length > 0 ? (
              <ImageGallery images={state.editing.results} />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>上传图片并输入编辑描述开始修改</p>
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

export default ImageEdit;

