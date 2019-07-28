for /r %%n in (mombot.ts) do call :checkit "%%n" 
goto end

:checkit
echo %1 | find /n "\source\" >NUL 2>NUL
if errorlevel 1 twxc.exe "%1"

:end
timeout 10