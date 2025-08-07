import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';

export function ConfigPanel() {
  const { state, actions } = useApp();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempConfig, setTempConfig] = useState(state.config);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    actions.setConfig(tempConfig);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(state.config);
    setIsOpen(false);
  };

  const isConfigValid = tempConfig.apiKey && tempConfig.endpoint && tempConfig.deploymentName;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          配置
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Azure OpenAI 配置</DialogTitle>
          <DialogDescription>
            配置您的 Azure OpenAI 服务连接信息
          </DialogDescription>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">连接设置</CardTitle>
            <CardDescription>
              请输入您的 Azure OpenAI 服务详细信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">服务端点</Label>
              <Input
                id="endpoint"
                placeholder="https://your-resource.openai.azure.com"
                value={tempConfig.endpoint}
                onChange={(e) => setTempConfig({ ...tempConfig, endpoint: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API 密钥</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="输入您的 API 密钥"
                  value={tempConfig.apiKey}
                  onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deploymentName">部署名称</Label>
              <Input
                id="deploymentName"
                placeholder="gpt-image-1"
                value={tempConfig.deploymentName}
                onChange={(e) => setTempConfig({ ...tempConfig, deploymentName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiVersion">API 版本</Label>
              <Input
                id="apiVersion"
                placeholder="2025-04-01-preview"
                value={tempConfig.apiVersion}
                onChange={(e) => setTempConfig({ ...tempConfig, apiVersion: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!isConfigValid}>
            保存配置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConfigPanel;

