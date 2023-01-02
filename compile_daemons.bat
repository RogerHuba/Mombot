for /r %%n in (*alienhunt.ts) do call :checkit "%%n" 
copy daemons\watcher.cts startups\watcher.cts
copy daemons\chat.cts startups\chat.cts
copy daemons\viewscreen.cts startups\viewscreen.cts
goto end

:checkit
echo %1 | find /n "daemons\" >NUL 2>NUL
if not errorlevel 1 twxc.exe "%1"
:end
