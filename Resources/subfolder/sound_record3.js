var win = Titanium.UI.currentWindow;

Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;
var recording = Ti.Media.createAudioRecorder();
var file;
var sound;
var audioSample = 'recording.wav';
var file_recorded = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, audioSample);

upload_audio = file_recorded.read();

var payload = {
	"media": upload_audio,
	"name": audioSample
};

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;

// default compression is Ti.Media.AUDIO_FORMAT_LINEAR_PCM
// default format is Ti.Media.AUDIO_FILEFORMAT_CAF

// this will give us a wave file with µLaw compression which
// is a generally small size and suitable for telephony recording
// for high end quality, you'll want LINEAR PCM - however, that
// will result in uncompressed audio and will be very large in size
recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
recording.format = Ti.Media.AUDIO_FILEFORMAT_WAVE;

var start = Titanium.UI.createButton({	
	title:'Start Recording',
	height:40,
	width:145,
	right:80,
	top:60
});
win.add(start);
start.addEventListener('click', function()
{
	if (recording.recording)
	{
		file = recording.stop();
		var f = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, 'recording.wav');
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

var b2 = Titanium.UI.createButton({
	title:'Playback Recording',
	width:180,
	height:40,
	top:120
});

//

win.add(b2);
b2.addEventListener('click', function()
{
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
});

var upload = Titanium.UI.createButton({
	title:'Upload',
	height:40,
	width:145,
	right:80,
	top:180
});
win.add(upload);
upload.addEventListener('click', function(e) {
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
	xhr.open('POST', 'http://localhost/upload_audio2.php', false); //false makes it synchronous
	xhr.setRequestHeader("Content-Type", "audio/x-wav");
	xhr.send(payload);
});

var upload_coords = Titanium.UI.createButton({
	title:'Coords Upload',
	height:40,
	width:145,
	right:80,
	top:220
});
win.add(upload_coords);
upload_coords.addEventListener('click', function(e) {

	function currentLocation() {
		Titanium.Geolocation.getCurrentPosition(function(e){
	        var coordinates={latitude: e.coords.latitude, longitude: e.coords.longitude};
			return coordinates;
		});

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
	xhr.open('POST', 'http://localhost/upload_audio2.php', false);
	//xhr.setRequestHeader("Content-Type", "text");
	xhr.send(coordinates);
	};
	
});