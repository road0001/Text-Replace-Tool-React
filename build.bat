@echo off
call npm run build
xcopy /E /Y build\* Text-Replace-Tool-React\
pause