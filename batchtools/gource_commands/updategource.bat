@echo off
echo This will overwrite the file, and thus revert the "fix". Continue?
echo Note that this file will not be uploaded to the repo.
pause
gource --output-custom-log PROPER_GOURCE_HISTORY.txt
