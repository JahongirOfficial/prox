#!/bin/bash
# Quick VPS commands for prox.uz

case "$1" in
  deploy)
    echo "🚀 Full deployment..."
    cd /opt/prox.uz
    git pull
    ./full-deploy.sh
    ;;
  
  quick)
    echo "⚡ Quick deployment (no frontend rebuild)..."
    cd /opt/prox.uz
    git pull
    ./quick-fix-deploy.sh
    ;;
  
  logs)
    echo "📋 Showing logs..."
    pm2 logs prox-uz-backend --lines ${2:-50}
    ;;
  
  status)
    echo "📊 Status..."
    pm2 status
    curl -s http://localhost:5003/api/health | jq .
    ;;
  
  restart)
    echo "🔄 Restarting..."
    pm2 restart prox-uz-backend
    ;;
  
  nginx)
    echo "🌐 Nginx status..."
    sudo nginx -t
    sudo systemctl status nginx
    ;;
  
  fix)
    echo "🔧 Emergency fix..."
    cd /opt/prox.uz/server
    npx tsc --skipLibCheck
    cd ..
    pm2 restart prox-uz-backend
    ;;
  
  *)
    echo "Usage: $0 {deploy|quick|logs|status|restart|nginx|fix}"
    echo ""
    echo "Commands:"
    echo "  deploy  - Full deployment (frontend + backend)"
    echo "  quick   - Quick deployment (backend only)"
    echo "  logs    - Show PM2 logs"
    echo "  status  - Show status"
    echo "  restart - Restart backend"
    echo "  nginx   - Check nginx"
    echo "  fix     - Emergency rebuild"
    ;;
esac
