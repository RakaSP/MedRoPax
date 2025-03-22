@echo off
cd ..\frontend
start serve -s build -p 3000
cd ..\backendv2
node server.js
