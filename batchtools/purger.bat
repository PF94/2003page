@echo off
title chaz!zTech 2003page Subsite Purger
color 0A
echo Doing Git Shenanigans...
git fetch
git pull
cd..
cd subsites
echo When you press enter, you agree that you're not willing to vandalize 2003page subsites. This is a tool designed for easily nuking subsites once the original creator has left. If this is used for vandalism, whoever is using this will be kicked from the project.
pause
:option
color 1F
dir
set /p choice= "Please select a subsite to nuke :"
color 4F
echo Do you want to nuke the '%choice%' subsite?
set /p OPTION= "[Y/N]"
IF "%OPTION%"=="N" goto option
IF "%OPTION%"=="Y" goto ohfuck
:ohfuck
RD %choice% /s /q
echo Doing Git Shenanigans...
git add
git commit
git push
pause