@ECHO OFF
REM Wechselt ins Verzeichnis des Batch-Skripts
cd /D %~dp0

REM Führt das Node.js-Skript aus und übergibt das Exportzielverzeichnis als Argument
node BootstrapToNuxt.js %1