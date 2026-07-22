# NetEngineerLab同步到GitHub

目标仓库：

```text
https://github.com/NetEngineerLab/website.git
```

## 检查当前目录

```text
cd /d D:\NetEngineerLab
git status
git remote -v
```

## 已经存在origin

```text
git add .
git commit -m "Prepare NetEngineerLab V1.7.3 production launch"
git push origin main
```

## 没有origin

```text
git remote add origin https://github.com/NetEngineerLab/website.git
git branch -M main
git add .
git commit -m "Prepare NetEngineerLab V1.7.3 production launch"
git push -u origin main
```

## 重要说明

`.gitignore`已经排除：

```text
website_backup\
*.zip
.vscode\
node_modules\
```

推送完成后，GitHub Actions会自动运行：

```text
npm run prepare:launch
```

在GitHub仓库的`Actions`页面确认`Production Quality Gate`为绿色通过，再连接Cloudflare Pages。
