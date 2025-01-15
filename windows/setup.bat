@echo off
cd ..\backendv2\MedRoPax-Solver
python setup.py
cd ..\..\frontend
start npm install
cd ..\backendv2
npm install

