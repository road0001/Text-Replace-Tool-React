@echo off
rmdir /S /Q build
rmdir /S /Q "Text-Replace-Tool-React\static"
del /Q "Text-Replace-Tool-React\debug.log"
call npm run build
xcopy /E /Y build\* Text-Replace-Tool-React\
pause