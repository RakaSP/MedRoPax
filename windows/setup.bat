@echo off
cd ..\frontend
start npm install
cd ..\backendv2
npm install
cd ..\backendv2\MedRoPax-Solver
python setup.py
