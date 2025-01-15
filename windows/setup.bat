@echo off
cd ..\backendv2\MedRoPax-Solver
python setup.py
cd ..\..\frontend
npm install
cd ..\backendv2
npm install

