/*
This section of the code will do the following:
Audio:
- Record an audio file with a ".wav" extension
- Playback immediate file
- Send audio file to a server that will interpert through PHP where to save it
GPS:
- Log current GPS coordinates
- Button press to send GPS coordinates
*/
var win = Titanium.UI.currentWindow;

//
//Recording Audio Global Identifiers
//

Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;
var recording = Ti.Media.createAudioRecorder();
var file;
var sound;
var audioSample = 'recording.wav';
var file_recorded = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, audioSample);
upload_audio = file_recorded.read();
// default compression is Ti.Media.AUDIO_FORMAT_LINEAR_PCM
// default format is Ti.Media.AUDIO_FILEFORMAT_CAF

// this will give us a wave file with µLaw compression which
// is a generally small size and suitable for telephony recording
// for high end quality, you'll want LINEAR PCM - however, that
// will result in uncompressed audio and will be very large in size
recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
recording.format = Ti.Media.AUDIO_FILEFORMAT_WAVE;

//
//Geolocation Global Identifiers
//

var uploadGPS = '';
var updatedLocation;
var updatedLatitude;
var latitude;
var longitude;
var coordinates = 'coordinates';
Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;


//Creation of a new Directory to store both GPS and audio files
var newDir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'mydir');
newDir.createDirectory();
Titanium.API.info('Path to newdir: ' + newDir.nativePath);

//Getting the files - GPS
var gps_recorded = Titanium.Filesystem.getFile(newDir.nativePath, 'coordinates');
//Loading file into a variable
var uploadGPS = gps_recorded.read();
//Outputting Variable into Titanium GUI for debugging
Titanium.API.info(uploadGPS);

//
//HTTPClient "Payload" Global Identifiers
//
var audio_payload = {
	"media": upload_audio,
	"name": audioSample
};

var gps_coordinates = {
	"coords": uploadGPS,
	"name": coordinates
};

////////////////////////////////////////////////////////////////////

// Get Current Position - This fires only once
Titanium.Geolocation.getCurrentPosition(function(e){
		if (!e.success || e.error)
		{
			currentLocation.text = 'error: ' + JSON.stringify(e.error);
			alert('error ' + JSON.stringify(e.error));
			return;
		}
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		
		//Establishes a JSON array for GPS
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
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		updatedLocation.text = 'long:' + longitude;
		updatedLatitude.text = 'lat: '+ latitude;
		
		var datatoWrite = {
							"latitude":latitude, 
							"longitude":longitude
										};
		
		//Data to write?
		var newFile = Titanium.Filesystem.getFile(newDir.nativePath,'coordinates');
		newFile.write(JSON.stringify(datatoWrite));
});

////////////////////////////////////////////////////////////////////

//
//Button - Start Recording
//

var start = Titanium.UI.createButton({	
	title:'Start Recording',
	height:40,
	width:145,
	right:80,
	top:60
});

//

win.add(start);
	start.addEventListener('click', function()
	{
		if (recording.recording)
		{
			file = recording.stop();
			var f = Titanium.Filesystem.getFile(newDir.nativePath, 'recording.wav');
			if (f.exists()) {f.deleteFile();}
			f.write(file.toBlob);
			start.title = "Start Recording";
			//clearInterval(timer);
			Ti.Media.stopMicrophoneMonitor();
		}
		else
		{
			if (!Ti.Media.canRecord) {
				Ti.UI.createAlertDialog({
					title:'Error!',
					message:'No audio recording hardware is currently connected.'
					}).show();
					return;
				}
				start.title = "Stop Recording";
				recording.start();
				Ti.Media.startMicrophoneMonitor();
				duration = 0;
				//timer = setInterval(showLevels,1000);
			}
});

//
//Button - Playback Recording
//

var b2 = Titanium.UI.createButton({
	title:'Playback Recording',
	height:40,
	width:180,
	top:120
});

//

win.add(b2);
	b2.addEventListener('click', function()
	{
		if (typeof f === 'undefined') 
		{
			Titanium.UI.createAlertDialog({
				title:'Error',
				message:'You have not recorded anything yet!'
			}).show();
			return;
		} else {
		if (sound && sound.playing)
		{
			sound.stop();
			sound.release();
			sound = null;
			b2.title = 'Playback Recording';
		}
		else
		{
			Ti.API.info("recording file size: "+file.size);
			sound = Titanium.Media.createSound({sound:file});
			sound.addEventListener('complete', function()
			{
				b2.title = 'Playback Recording';
			});
			sound.play();
			b2.title = 'Stop Playback';
		}
	}
});

//
//Button - Upload Audio
//

var upload = Titanium.UI.createButton({
	title:'Upload',
	height:40,
	width:145,
	right:80,
	top:180
});

//

win.add(upload);
	upload.addEventListener('click', function(e) 
	{
		if (typeof f === 'undefined')
		{
			Titanium.UI.createAlertDialog({
				title:'Error',
				message:'You have not recorded anything yet!'
			}).show();
			return;
		} else {
		upload.title = "Recorded: " + file.size;
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
		xhr.open('POST', 'http://localhost/upload_audio.php', false); //false makes it synchronous
		xhr.setRequestHeader("Content-Type", "audio/x-wav");
		xhr.send(audio_payload);
		}
	});
	
//
//Button - Coords Upload
//

var upload_coords = Titanium.UI.createButton({
	title:'Coords Upload',
	height:40,
	width:145,
	right:80,
	top:240
});

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

////////////////////////////////////////////////////////////////////

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