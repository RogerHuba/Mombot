for /r %%n in (*ztm.ts) do call :checkit "%%n" 
goto end

:checkit
timeout 20
echo %1 | find /n "\source\" >NUL 2>NUL
if errorlevel 1 twxc.exe "%1"
:end 