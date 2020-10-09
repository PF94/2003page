@echo off
echo This will overwrite the file, and thus revert the "fix". Continue?
pause
gource --output-custom-log PROPER_GOURCE_HISTORY.txt
