@echo off
echo ======================================
echo 微信开发者工具模拟器修复脚本
echo ======================================
echo.

echo 正在检查系统信息...
systeminfo | findstr /B /C:"OS Name"
systeminfo | findstr /B /C:"Total Physical Memory"

echo.
echo 正在清理微信开发者工具缓存...
set APPDATA=%USERPROFILE%\AppData\Roaming
if exist "%APPDATA%\Tencent\微信开发者工具" (
    echo 清理缓存文件...
    rmdir /s /q "%APPDATA%\Tencent\微信开发者工具\Cache"
    echo 缓存清理完成
) else (
    echo 未找到缓存文件夹
)

echo.
echo 正在检查端口占用...
netstat -ano | findstr :9420
if %ERRORLEVEL%==0 (
    echo 端口9420被占用，正在结束进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9420') do (
        taskkill /PID %%a /F
    )
) else (
    echo 端口9420未被占用
)

echo.
echo 正在注册必要的组件...
regsvr32 /s "C:\Windows\System32\jscript.dll"
regsvr32 /s "C:\Windows\System32\vbscript.dll"

echo.
echo ======================================
echo 修复完成！请重新启动微信开发者工具
echo ======================================
echo.
echo 如果问题仍然存在，请尝试以下步骤：
echo 1. 以管理员身份运行微信开发者工具
echo 2. 关闭杀毒软件的实时保护
echo 3. 重启计算机
echo 4. 重新安装最新版本的微信开发者工具
echo.
pause