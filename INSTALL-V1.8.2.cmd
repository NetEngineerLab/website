@echo off
setlocal
cd /d "%~dp0"
echo [1/4] Installing NetEngineerLab V1.8.2 files...
if not exist website\tools\poe-power-budget-calculator\index.html (
  echo ERROR: Package is incomplete.
  exit /b 1
)
echo [2/4] Running PoE engine tests...
node website\tools\poe-power-budget-calculator\docs\engine-test.js || exit /b 1
echo [3/4] Running production acceptance...
call npm run prepare:launch || exit /b 1
echo [4/4] PASS: NetEngineerLab V1.8.2 is ready.
echo Next: copy this package into your Git repository, commit, and push main.
endlocal
