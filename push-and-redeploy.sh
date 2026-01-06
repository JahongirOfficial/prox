#!/bin/bash
# Quick push and redeploy

echo "📤 Pushing to GitHub..."
git add .
git commit -m "Fix: Add .js extensions to ESM imports in routes"
git push origin main

echo ""
echo "✅ Pushed! Now run on VPS:"
echo "cd /opt/prox.uz && git pull && ./quick-fix-deploy.sh"
