import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Wand2, Edit3, Github, ExternalLink } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import ImageGeneration from './components/ImageGeneration.jsx';
import ImageEdit from './components/ImageEdit.jsx';
import './App.css';

function AppContent() {
  const { state, actions } = useApp();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Azure OpenAI Image Generator</h1>
                  <p className="text-sm text-muted-foreground">基于 GPT-Image-1 模型的图片生成和编辑工具</p>
                </div>
              </div>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/ottodeng/azure-openai-image-app" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/dall-e?tabs=gpt-image-1" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  文档
                </a>
              </Button>
              <ConfigPanel />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={state.activeTab} onValueChange={actions.setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              图片生成
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              图片编辑
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            <ImageGeneration />
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-6">
            <ImageEdit />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              <p>基于 Azure OpenAI GPT-Image-1 模型构建</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>支持的功能:</span>
              <Badge variant="outline">图片生成</Badge>
              <Badge variant="outline">图片编辑</Badge>
              <Badge variant="outline">多图片处理</Badge>
              <Badge variant="outline">参数自定义</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

