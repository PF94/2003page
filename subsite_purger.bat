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
IF "%CHOICE%"=="contributing" goto ERROR
color 4F
echo Do you want to nuke the '%choice%' subsite?
set /p OPTION= "[Y/N]"
IF "%OPTION%"=="N" goto option
IF "%OPTION%"=="Y" goto ohfuck
:ohfuck
echo Purging subsite
RD %choice% /s /q
Copying retired subsite template
MD %choice%
copy "contributing\Retiring\TEMPLATE.html" "%CHOICE%"
cd %choice%
ren TEMPLATE.html index.html
cd..
echo Generating message
cd %choice%
echo WARNING > readme.txt
echo This subsite was purged by the internal public Batch application known as chaz!zTech 2003page Subsite Purger >> readme.txt
echo A list about the infomation of whoever operated this command can be seen below >> readme.txt
echo Computer: %COMPUTERNAME% >> readme.txt
echo Windows Username: %USERNAME% >> readme.txt
echo Windows Installation Folder: %SystemRoot% >> readme.txt
echo User's PATH: %Path% >> readme.txt
echo If this is vandalism, revert this commit, if not, then do nothing, but keep this file for reference's sakes. >> readme.txt
echo Doing Git Shenanigans...
git add
git commit -a -m "Deleting subsite [%choice%] with 2003page Purger Tool - Part 1"
git push
echo Repeating Git Shenanigans...
git add
git commit -a -m "Deleting subsite [%choice%] with 2003page Purger Tool - Part 2"
git push
echo DONE
pause
exit

:ERROR
echo Invalid
pause
goto option