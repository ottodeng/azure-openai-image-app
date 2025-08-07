#!/bin/bash

# 快速启动脚本
set -e

echo "🐳 Azure OpenAI 图像生成应用 - Docker 快速启动"
echo "================================================"

# 检查是否存在 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  没有找到 .env 文件，正在创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑并填入您的 Azure OpenAI 配置"
    echo "📝 需要配置以下变量："
    echo "   - VITE_AZURE_OPENAI_ENDPOINT"
    echo "   - VITE_AZURE_OPENAI_API_KEY" 
    echo "   - VITE_AZURE_OPENAI_DEPLOYMENT"
    echo "   - VITE_AZURE_OPENAI_API_VERSION"
    echo ""
    read -p "是否现在编辑 .env 文件？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env
    fi
fi

echo "🔨 正在构建 Docker 镜像..."
docker-compose build

echo "🚀 启动应用服务..."
docker-compose up -d

echo "⏳ 等待应用启动..."
sleep 10

# 检查健康状态
echo "🩺 检查应用健康状态..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 应用健康检查通过！"
else
    echo "⚠️  健康检查失败，但应用可能仍在启动中..."
fi

echo ""
echo "🎉 应用已启动！"
echo "📱 访问地址: http://localhost:3000"
echo ""
echo "📋 常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止应用: docker-compose stop"
echo "   重启应用: docker-compose restart"
echo "   完全清理: docker-compose down --rmi all"
echo ""
