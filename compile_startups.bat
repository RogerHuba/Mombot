for /r %%n in (*haggle.ts) do call :checkit "%%n" 
goto end

:checkit
echo %1 | find /n "startups\" >NUL 2>NUL
if not errorlevel 1 twxc.exe "%1"

:end