var exec = require('child_process').exec;
var src='d:/2345好压';
var dist='f:/2345好压'
exec('xcopy "'+ src + '" "' + dist +'" /E /C /Y /H /I');