var express = require('express');
var app = express();
app.use(express.static(__dirname + 'public'));
var iw = require('iwlist')('wlan0')  ;
var path = require('path');
var tj = require('templatesjs');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));



//iw.scan(function(err, result) {
//	console.log(result);	
//	for(var i in result){
//	console.log(result[i].essid);
//	}
//})








const fs = require('fs');

app.get('/', function(req, res) {
    iw.scan(function(err, result) {
	var data = fs.readFileSync('./index.html');
    	tj.setSync(data);
    	var ssids = [];
        console.log(result);
        for(var i in result){
        console.log(result[i].essid);
	ssids.push(result[i].essid)
        }
	var output =  tj.renderSync("ssid",ssids);
    	res.write(output);
    	res.end()
    })
});

app.post('/save', function(request, res) {
	console.log(request.body.ssid);
	console.log(request.body.password)
	fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
        ssid="` + request.body.ssid + `"
        psk="` + request.body.password + `"
        key_mgmt=WPA-PSK
}`, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");

   res.write("<html>Rebooting Scanner</html>")
   res.end();
   require("child_process").exec('reboot', function(msg){});

});
});

var server = app.listen(3000);
