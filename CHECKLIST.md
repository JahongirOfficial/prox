# ✅ PROX.UZ DEPLOYMENT CHECKLIST

## BEFORE DEPLOYMENT

### On Windows (Local Machine)
- [ ] All files saved
- [ ] Review changes in `ecosystem.config.cjs`
- [ ] Review changes in `nginx-prox.uz.conf`
- [ ] Review `DEPLOY_NOW.sh` script

### Push to GitHub
```powershell
cd prox.uz
.\push-fixes.ps1
```
- [ ] Git push successful
- [ ] Changes visible on GitHub

---

## DEPLOYMENT ON VPS

### Step 1: Connect to VPS
```bash
ssh root@your-vps-ip
```
- [ ] Connected to VPS

### Step 2: Navigate and Pull
```bash
cd /opt/prox.uz
git stash
git pull
```
- [ ] In correct directory
- [ ] Latest code pulled

### Step 3: Run Deployment Script
```bash
chmod +x DEPLOY_NOW.sh
./DEPLOY_NOW.sh
```
- [ ] Script executed
- [ ] No errors during build
- [ ] PM2 process started

---

## VERIFICATION

### Check PM2 Status
```bash
pm2 list
```
- [ ] prox-uz-backend is **online**
- [ ] All other projects still **online**
- [ ] No processes in **errored** state

### Check Backend Logs
```bash
pm2 logs prox-uz-backend --lines 20
```
- [ ] No JWT errors
- [ ] MongoDB connected successfully
- [ ] Server listening on port 5004

### Test Backend API
```bash
curl http://localhost:5004/api/health
```
- [ ] Returns success response (not "Token topilmadi")

### Test Frontend
```bash
curl https://prox.uz
```
- [ ] Returns HTML (not 500 error)
- [ ] No nginx errors

### Check Port Usage
```bash
lsof -i :5004
```
- [ ] Shows node process for prox-uz-backend

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```
- [ ] Nginx config test passed
- [ ] Nginx is active and running

---

## BROWSER TESTING

### Open in Browser
- [ ] Visit https://prox.uz
- [ ] Page loads without errors
- [ ] No console errors (F12)
- [ ] Can see login page

### Test Login (if you have credentials)
- [ ] Login form works
- [ ] No JWT errors
- [ ] Dashboard loads

---

## VERIFY OTHER PROJECTS

### Check Other Sites
```bash
curl https://alibobo.uz
curl https://alochi.uz
```
- [ ] alibobo.uz still working
- [ ] alochi.uz still working
- [ ] Other sites still working

### Check PM2 Processes
```bash
pm2 list
```
- [ ] alibobo-backend: online
- [ ] alochi-backend: online
- [ ] avtojon-api: online (port 5003)
- [ ] debt-tracker: online
- [ ] All others: online

---

## IF SOMETHING GOES WRONG

### Backend Not Starting
```bash
pm2 logs prox-uz-backend
pm2 restart prox-uz-backend
```

### Port Conflict
```bash
lsof -i :5004
# If wrong process, kill it:
lsof -ti:5004 | xargs kill -9
pm2 restart prox-uz-backend
```

### Nginx 500 Error
```bash
sudo tail -f /var/log/nginx/prox.uz-error.log
ls -la /opt/prox.uz/dist
# If dist missing:
cd /opt/prox.uz && npm run build
```

### JWT Still Failing
```bash
pm2 delete prox-uz-backend
pm2 start /opt/prox.uz/ecosystem.config.cjs
pm2 logs prox-uz-backend
```

---

## ROLLBACK (Emergency)

If everything breaks:
```bash
# Stop prox-uz
pm2 delete prox-uz-backend

# Verify other projects
pm2 list

# Check other sites
curl https://alibobo.uz
curl https://alochi.uz

# Restore from git
cd /opt/prox.uz
git reset --hard HEAD~1
./DEPLOY_NOW.sh
```

---

## SUCCESS CRITERIA

✅ All items checked above  
✅ prox.uz loads in browser  
✅ No JWT errors in logs  
✅ Backend responds on port 5004  
✅ All other projects still running  
✅ No nginx errors  

---

## FINAL NOTES

- **Estimated Time**: 5-10 minutes
- **Downtime**: ~2 minutes during PM2 restart
- **Risk Level**: Low (only affects prox.uz)
- **Rollback Time**: ~2 minutes if needed

---

**Date**: January 6, 2026  
**Status**: Ready for deployment  
**Next Step**: Push to GitHub, then run on VPS

