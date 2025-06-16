@echo off
echo Restarting the InkQuiry backend server...
echo.

cd %~dp0
echo Working directory: %cd%

echo Installing any missing dependencies...
pip install -r requirements.txt

echo.
echo Starting the server...
echo Press Ctrl+C to stop the server.
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8900
