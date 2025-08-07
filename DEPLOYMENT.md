# 部署指南

本文档提供了 Azure OpenAI Image Generator 应用的详细部署说明，包括本地开发、生产部署和 Docker 容器化等多种部署方式。

## 目录

1. [环境要求](#环境要求)
2. [本地开发部署](#本地开发部署)
3. [生产环境部署](#生产环境部署)
4. [Docker 容器化部署](#docker-容器化部署)
5. [云平台部署](#云平台部署)
6. [环境变量配置](#环境变量配置)
7. [故障排除](#故障排除)
8. [性能优化](#性能优化)

## 环境要求

### 基础要求

- **Node.js**: 18.0.0 或更高版本
- **包管理器**: pnpm (推荐) 或 npm
- **浏览器**: 支持现代 JavaScript 的浏览器 (Chrome 90+, Firefox 88+, Safari 14+)

### Azure OpenAI 要求

- Azure 订阅账户
- Azure OpenAI 服务实例
- GPT-Image-1 模型部署
- 有效的 API 密钥

### Docker 要求 (可选)

- Docker Engine 20.10+ 
- Docker Compose 2.0+

## 本地开发部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd azure-openai-image-app
```

### 2. 安装依赖

使用 pnpm (推荐):
```bash
pnpm install
```

或使用 npm:
```bash
npm install
```

### 3. 配置环境变量 (可选)

创建 `.env.local` 文件:
```bash
# Azure OpenAI 配置 (可选，也可在应用界面配置)
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-api-key
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-image-1
VITE_AZURE_OPENAI_API_VERSION=2025-04-01-preview
```

### 4. 启动开发服务器

```bash
pnpm run dev
```

应用将在 `http://localhost:5173` 启动。

### 5. 配置 Azure OpenAI

在应用界面右上角点击"配置"按钮，填入您的 Azure OpenAI 服务信息。

## 生产环境部署

### 1. 构建生产版本

```bash
pnpm run build
```

构建产物将生成在 `dist/` 目录中。

### 2. 静态文件部署

#### 使用 Nginx

1. 安装 Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. 配置 Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/azure-openai-image-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. 复制文件并重启:
```bash
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

#### 使用 Apache

1. 安装 Apache:
```bash
sudo apt update
sudo apt install apache2
```

2. 配置 .htaccess:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

3. 复制文件:
```bash
sudo cp -r dist/* /var/www/html/
sudo systemctl restart apache2
```

## Docker 容器化部署

### 1. 使用 Docker Compose (推荐)

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

应用将在 `http://localhost:3000` 可用。

### 2. 使用 Docker 命令

```bash
# 构建镜像
docker build -t azure-openai-image-app .

# 运行容器
docker run -d \
  --name azure-openai-image-app \
  -p 3000:8080 \
  azure-openai-image-app

# 查看日志
docker logs azure-openai-image-app

# 停止容器
docker stop azure-openai-image-app
docker rm azure-openai-image-app
```

### 3. 健康检查

容器包含内置健康检查:
```bash
# 检查容器健康状态
docker ps

# 手动健康检查
curl http://localhost:3000/health
```

## 云平台部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置构建设置:
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
3. 部署完成后获得 HTTPS URL

### Netlify 部署

1. 方式一：拖拽部署
   ```bash
   pnpm run build
   # 将 dist/ 目录拖拽到 Netlify 部署页面
   ```

2. 方式二：Git 集成
   - 连接 GitHub 仓库
   - Build command: `pnpm run build`
   - Publish directory: `dist`

### Azure Static Web Apps

1. 在 Azure 门户创建 Static Web App
2. 连接 GitHub 仓库
3. 配置构建设置:
   ```yaml
   app_location: "/"
   api_location: ""
   output_location: "dist"
   ```

### AWS S3 + CloudFront

1. 创建 S3 存储桶并启用静态网站托管
2. 上传构建文件:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```
3. 配置 CloudFront 分发
4. 设置自定义错误页面指向 `index.html`

## 环境变量配置

### 开发环境

创建 `.env.local` 文件:
```bash
# Azure OpenAI 配置
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-api-key
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-image-1
VITE_AZURE_OPENAI_API_VERSION=2025-04-01-preview

# 应用配置
VITE_APP_TITLE=Azure OpenAI Image Generator
VITE_APP_VERSION=1.0.0
```

### 生产环境

对于生产环境，建议通过应用界面配置 Azure OpenAI 信息，而不是硬编码在环境变量中。

### Docker 环境变量

在 `docker-compose.yml` 中配置:
```yaml
services:
  azure-openai-image-app:
    environment:
      - NODE_ENV=production
      - VITE_AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - VITE_AZURE_OPENAI_DEPLOYMENT=${AZURE_OPENAI_DEPLOYMENT}
```

## 故障排除

### 常见问题

#### 1. 构建失败

**问题**: `pnpm run build` 失败
**解决方案**:
```bash
# 清理缓存
pnpm store prune
rm -rf node_modules
pnpm install

# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0
```

#### 2. Docker 构建失败

**问题**: Docker 构建过程中 pnpm 安装失败
**解决方案**:
```bash
# 确保 Docker 版本足够新
docker --version

# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

#### 3. 应用无法访问

**问题**: 部署后无法访问应用
**解决方案**:
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 检查防火墙设置
sudo ufw status

# 检查容器状态
docker ps
docker logs azure-openai-image-app
```

#### 4. API 调用失败

**问题**: Azure OpenAI API 调用失败
**解决方案**:
1. 检查 API 密钥是否正确
2. 确认端点 URL 格式正确
3. 验证部署名称是否匹配
4. 检查 Azure OpenAI 服务状态

### 调试模式

启用详细日志:
```bash
# 开发环境
VITE_DEBUG=true pnpm run dev

# 生产环境 (Docker)
docker-compose logs -f azure-openai-image-app
```

## 性能优化

### 前端优化

1. **启用 Gzip 压缩**:
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **设置缓存头**:
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **使用 CDN**:
   - 将静态资源部署到 CDN
   - 配置适当的缓存策略

### 容器优化

1. **多阶段构建**:
   - 已在 Dockerfile 中实现
   - 减少最终镜像大小

2. **资源限制**:
   ```yaml
   services:
     azure-openai-image-app:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

### 监控和日志

1. **应用监控**:
   ```bash
   # 使用 PM2 (Node.js 应用)
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 monit
   ```

2. **容器监控**:
   ```bash
   # 监控容器资源使用
   docker stats azure-openai-image-app
   
   # 查看详细日志
   docker logs -f --tail 100 azure-openai-image-app
   ```

## 安全配置

### HTTPS 配置

1. **使用 Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **强制 HTTPS 重定向**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### 安全头配置

在 Nginx 配置中添加:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline'" always;
```

## 备份和恢复

### 配置备份

```bash
# 备份用户配置 (localStorage)
# 用户需要手动导出配置或使用浏览器同步功能

# 备份应用代码
git clone <repository-url>
tar -czf azure-openai-image-app-backup.tar.gz azure-openai-image-app/
```

### 容器数据备份

```bash
# 备份容器配置
docker-compose config > docker-compose-backup.yml

# 导出镜像
docker save azure-openai-image-app:latest > azure-openai-image-app.tar

# 恢复镜像
docker load < azure-openai-image-app.tar
```

## 扩展部署

### 负载均衡

使用 Nginx 作为负载均衡器:
```nginx
upstream azure_openai_app {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    location / {
        proxy_pass http://azure_openai_app;
    }
}
```

### 容器编排

使用 Docker Swarm:
```bash
# 初始化 Swarm
docker swarm init

# 部署服务
docker stack deploy -c docker-compose.yml azure-openai-stack

# 扩展服务
docker service scale azure-openai-stack_azure-openai-image-app=3
```

---

如有其他部署问题，请参考项目 README.md 或提交 Issue。

