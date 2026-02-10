#!/bin/bash
# Скрипт для ручного деплоя на сервере
# Использование: ./deploy-server.sh

set -e  # Остановка при ошибке

PROJECT_DIR="$HOME/projects/Palladium/HoloXDubai"
DEPLOY_DIR="/var/www/holoxdubai"

echo "🚀 Starting deployment..."
cd "$PROJECT_DIR"

echo "📥 Pulling latest changes..."
git pull origin main || git pull origin master

echo "🏗️ Building project..."
npm run build

echo "📤 Copying files to $DEPLOY_DIR..."
sudo cp -r dist/* "$DEPLOY_DIR/"

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "✅ Deployment completed successfully at $(date)"
