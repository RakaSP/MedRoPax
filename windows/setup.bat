@echo off
cd ..\backendv2\MedRoPax-Solver
call python setup.py
cd ..\..\frontend
call npm install
cd ..\backendv2
call npm install