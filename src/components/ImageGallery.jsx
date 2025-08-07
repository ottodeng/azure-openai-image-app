import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Download, Maximize2, Copy, Check } from 'lucide-react';

export function ImageGallery({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <Card key={image.id || index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={image.url}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-48 object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                {image.revised_prompt && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        修订提示词
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(image.revised_prompt, `prompt-${image.id}`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedId === `prompt-${image.id}` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.revised_prompt}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    图片 {index + 1}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImage(image)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>图片预览</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedImage.url}
                  alt="Preview"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              
              {selectedImage.revised_prompt && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">修订提示词</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(selectedImage.revised_prompt, `dialog-prompt-${selectedImage.id}`)}
                    >
                      {copiedId === `dialog-prompt-${selectedImage.id}` ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedImage.revised_prompt}
                  </p>
                </div>
              )}
              
              <div className="flex justify-center">
                <Button onClick={() => downloadImage(selectedImage)}>
                  <Download className="h-4 w-4 mr-2" />
                  下载图片
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ImageGallery;

