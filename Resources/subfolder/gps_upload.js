var win = Titanium.UI.currentWindow;

var uploadGPS = '';
var latitude;
var longitude;
var coordinates = 'coordinates';
Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;

//Creation of a new Directory
var newDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'mydir');
newDir.createDirectory();
Titanium.API.info('Path to newdir: ' + newDir.nativePath);

var gps_recorded = Titanium.Filesystem.getFile(newDir.nativePath, 'coordinates');
var uploadGPS = gps_recorded.read();
Titanium.API.info(uploadGPS);
//
// Geolocation Text
//

var updatedLocationLabel = Titanium.UI.createLabel({
	text:'Updated Location',
	font:{fontSize:12, fontWeight:'bold'},
	color:'#111',
	top:280, //Base number
	left:100, //same
	height:15, //same
	width:300 //same
});
win.add(updatedLocationLabel);

var updatedLocation = Titanium.UI.createLabel({
	text:'Updated Location not fired',
	font:{fontSize:11},
	color:'#444',
	top:300, // + 20 difference
	left:100, //same
	height:15, //same
	width:300 //same
});
win.add(updatedLocation);

var updatedLatitude = Titanium.UI.createLabel({
	text:'',
	font:{fontSize:11},
	color:'#444',
	top:320, // + 40 difference
	left:100, //same
	height:15, //same
	width:300 //same
});
win.add(updatedLatitude);

//
// Get current position - This fires once
//


Titanium.Geolocation.getCurrentPosition(function(e){
		if (!e.success || e.error)
		{
			currentLocation.text = 'error: ' + JSON.stringify(e.error);
			alert('error ' + JSON.stringify(e.error));
			return;
		}
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		
		//Titanium.App.Properties.setDouble('longitde',longitude);
		//Titanium.App.Properties.setDouble('latitude',latitude);
		
		//Establishes a JSON array
		var datatoWrite = {
							"latitude":latitude, 
							"longitude":longitude
										};
		
		//Data to write?
		var newFile = Titanium.Filesystem.getFile(newDir.nativePath,'coordinates');
		newFile.write(JSON.stringify(datatoWrite));
});
Titanium.Geolocation.addEventListener('location', function(e){
		if (!e.success || e.error)
		{
			updatedLocation.text = 'error:' + JSON.stringify(e.error);
			updatedLatitude.text = '';
			updatedLocationAccuracy.text = '';
			updatedLocationTime.text = '';
			return;
		}
		longitude = e.coords.longitude;
		latitude = e.coords.latitude;
		updatedLocation.text = 'long:' + longitude;
		updatedLatitude.text = 'lat: '+ latitude;
		
		//Titanium.App.Properties.setDouble('longitde',longitude);
		//Titanium.App.Properties.setDouble('latitude',latitude);
		
		var datatoWrite = {
							"latitude":latitude, 
							"longitude":longitude
										};
		
		//Data to write? This is apparent overkill
		var newFile = Titanium.Filesystem.getFile(newDir.nativePath,'coordinates');
		newFile.write(JSON.stringify(datatoWrite));
});


//var datatoWrite = {"latitude":latitude, "longitude":longitude};
//datatoWrite.write(JSON.stringify(datatoWrite));

var gps_coordinates = {
	"coords": uploadGPS,
	"name": coordinates
};

//
//Button - Coords Upload
//

var upload_coords = Titanium.UI.createButton({
	title:'Coords Upload',
	height:40,
	width:145,
	right:80,
	top:220
});
win.add(upload_coords);
	upload_coords.addEventListener('click', function(e) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onerror = function(e)
		{
			Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
			Titanium.API.info('IN ERROR' + e.error);
		};
		xhr.setTimeout(20000);
		xhr.onload = function(e)
		{
			Titanium.UI.createAlertDialog({title:'Success', message:'status code ' + this.status}).show();
			Titanium.API.info('IN ONLOAD ' + this.status + ' readyState ' + this.readyState);
		};
		xhr.onsendstream = function(e)
		{
			Titanium.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
		};
		//open the client
		xhr.open('POST', 'http://localhost/gps_audio.php', false);
		xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		xhr.send(gps_coordinates);
	});
