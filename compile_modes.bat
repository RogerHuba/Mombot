for /r %%n in (*defender.ts) do call :checkit "%%n" 
goto end

:checkit
echo %1 | find /n "modes\" >NUL 2>NUL
if not errorlevel 1 twxc.exe "%1"

:end
timeout 10

