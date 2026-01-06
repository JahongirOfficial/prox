# Git Windows'ga O'rnatish

## 1-usul: Git for Windows (Tavsiya etiladi)

1. Quyidagi havoladan yuklab oling:
   https://git-scm.com/download/win

2. Yuklab olingan faylni ishga tushiring va o'rnating

3. PowerShell yoki CMD'ni qayta oching

4. Tekshirish:
   ```cmd
   git --version
   ```

## 2-usul: Winget orqali (Windows 10/11)

PowerShell'da:
```powershell
winget install --id Git.Git -e --source winget
```

## Git sozlash

O'rnatgandan keyin:

```cmd
git config --global user.name "Sizning ismingiz"
git config --global user.email "sizning@email.com"
```

## Prox.uz loyihasini push qilish

Git o'rnatilgandan keyin:

```cmd
cd C:\Users\ozodb\Desktop\loyihalar\prox.uz

git add .
git commit -m "Deploy konfiguratsiyalari qo'shildi - Port 5003"
git push origin main
```

Keyin VPS'da:

```bash
ssh root@45.92.173.33
cd /opt/prox.uz
git pull
./deploy.sh
```
