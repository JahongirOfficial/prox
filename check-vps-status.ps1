# VPS'da prox.uz holatini tekshirish
Write-Host "🔍 VPS'da prox.uz holatini tekshirish..." -ForegroundColor Yellow

# VPS'ga SSH orqali ulanish va holatni tekshirish
$commands = @(
    "echo '📊 PM2 Status:'",
    "pm2 status",
    "echo ''",
    "echo '📋 Prox.uz backend logs (oxirgi 20 qator):'",
    "pm2 logs prox-uz-backend --lines 20",
    "echo ''",
    "echo '🌐 Port 5003 holatini tekshirish:'",
    "netstat -tlnp | grep :5003",
    "echo ''",
    "echo '🔗 MongoDB ulanishini tekshirish:'",
    "cd /opt/prox.uz && node -e 'import mongoose from \"mongoose\"; import dotenv from \"dotenv\"; dotenv.config({ path: \".env.production\" }); mongoose.connect(process.env.MONGODB_URI).then(() => console.log(\"✅ MongoDB ulandi\")).catch(e => console.log(\"❌ MongoDB xatolik:\", e.message)).finally(() => process.exit())'"
)

$commandString = $commands -join "; "

ssh root@45.92.173.33 $commandString