echo "*Press any key (except $) and the char code(s) will be displayed.*"
while TRUE
   getConsoleInput $key SINGLEKEY
   getCharCode $key $code
   clientMessage $code
end