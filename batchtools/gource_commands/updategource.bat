@echo off
echo NOTE: YOU MAY NEED TO RESAVE THE FILES AS UNIX, WHICH CAN CAUSE INCOMPATIBLITY ON WIN7
echo Note that this file will not be uploaded to the repo.
pause
gource --output-custom-log PROPER_GOURCE_HISTORY.txt
fix_usernames.sh