var config = require('../config')
const shellExec = require('shell-exec')

exports.init = async function() {
    // kill all chrome apps    
    shellExec('killall chromium').then(value => console.log(value.stdout + value.stderr));
    shellExec('chromium --user-data-dir=/home/pi/FotoBoxExpress/chromium_user/temp1 --window-position=0,0 --new-window --kiosk http://localhost:8000/fotobox').then(value => console.log(value.stdout + value.stderr)); // --user.data.dir=temp1 
    shellExec('chromium --user-data-dir=/home/pi/FotoBoxExpress/chromium_user/temp2 --window-position=2000,0 --new-window --kiosk http://localhost:8000/gallery').then(value => console.log(value.stdout + value.stderr));
}