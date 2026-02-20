@echo off
echo Removing nul files...
for /r %%f in (nul) do if exist "%%f" del "%%f"
echo Done!
pause
