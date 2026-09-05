@echo off
title Jarvis // JarSol Web 4.0 Autonomous OS
color 0b
cls

echo =====================================================================
echo  ⚡ JARSOL // CONWAY AUTOMATON 4.0 ^& TALKING JARVIS (MARK-XXXIX)
echo  ⚡ REAL-WORLD EARTH TIME, DATE, YEAR ^& SEASON AUTO-SYNCHRONIZED
echo =====================================================================
echo.
echo [1/3] Verifying Node.js environment...
node -v
echo.
echo [2/3] Building production assets...
call npm run build
echo.
echo [3/3] Launching permanent background server on port 3001...
start http://localhost:3001
echo.
echo ---------------------------------------------------------------------
echo 🌟 JARVIS SCI-FI KINGDOM ^& HUMANOID ROBOT IS NOW LIVE GLOBALLY!
echo 🌟 Access URL: http://localhost:3001
echo 🌟 Loopback:   http://127.0.0.1:3001
echo ---------------------------------------------------------------------
echo.
npm run start
pause