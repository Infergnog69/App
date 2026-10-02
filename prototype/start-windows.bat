@echo off
cd /d "%~dp0"
title newd MVP test
where py >nul 2>nul
if %errorlevel%==0 (
  py serve.py
) else (
  python serve.py
)
pause
