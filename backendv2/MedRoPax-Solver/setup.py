from venv import create
from os import getcwd
from os.path import join, abspath, isdir
from subprocess import run
import sys

# Define the virtual environment directory
dir = join(getcwd(), "vrp-venv")

# Ensure the virtual environment directory is created
if not isdir(dir):
    create(dir, with_pip=True)

# Determine the path to pip executable based on the platform
pip_executable = "bin/pip" if sys.platform != "win32" else "Scripts\\pip"

# Install dependencies
run([join(dir, pip_executable), "install",
    "-r", abspath("requirements.txt")], cwd=dir)
