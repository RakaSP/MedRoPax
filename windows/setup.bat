@echo off
cd ..\backendv2\MedRoPax-Solver
call python setup.py
cd ..\..\frontend
call npm install
call npm run build
cd ..\backendv2
call npm install