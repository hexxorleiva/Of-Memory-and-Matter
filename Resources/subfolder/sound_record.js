var win = Titanium.UI.currentWindow;

Titanium.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAY_AND_RECORD;
var recording = Ti.Media.createAudioRecorder();

// default compression is Ti.Media.AUDIO_FORMAT_LINEAR_PCM
// default format is Ti.Media.AUDIO_FILEFORMAT_CAF

// this will give us a wave file with µLaw compression which
// is a generally small size and suitable for telephony recording
// for high end quality, you'll want LINEAR PCM - however, that
// will result in uncompressed audio and will be very large in size
recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
recording.format = Ti.Media.AUDIO_FILEFORMAT_WAVE;

Ti.Media.addEventListener('recordinginput', function(e) {
	Ti.API.info('Input availability changed: '+e.available);
	if (!e.available && recording.recording) {
		b1.fireEvent('click', {});
	}
});

var file;
var timer;
var sound;
var duration = 0;


var label = Titanium.UI.createLabel({
	text:'',
	top:290,
	color:'#999',
	textAlign:'center',
	width:'auto',
	height:'auto'
});

win.add(label);


//I think this is a part of the script that details which sound input is being used.
/*
function lineTypeToStr()
{
	var type = Ti.Media.audioLineType;
	switch(type)
	{
		case Ti.Media.AUDIO_HEADSET_INOUT:
			return "headset";
		case Ti.Media.AUDIO_RECEIVER_AND_MIC:
			return "receiver/mic";
		case Ti.Media.AUDIO_HEADPHONES_AND_MIC:
			return "headphones/mic";
		case Ti.Media.AUDIO_HEADPHONES:
			return "headphones";
		case Ti.Media.AUDIO_LINEOUT:
			return "lineout";
		case Ti.Media.AUDIO_SPEAKER:
			return "speaker";
		case Ti.Media.AUDIO_MICROPHONE:
			return "microphone";
		case Ti.Media.AUDIO_MUTED:
			return "silence switch on";
		case Ti.Media.AUDIO_UNAVAILABLE:
			return "unavailable";
		case Ti.Media.AUDIO_UNKNOWN:
			return "unknown";
	}
}
*/

//Let's you know which audio microphone is current being used. Might not be useful at all.
/*
var linetype = Titanium.UI.createLabel({
	text: "audio line type: "+lineTypeToStr(),
	bottom:20,
	color:'#999',
	textAlign:'center',
	width:'auto',
	height:'auto'
});

win.add(linetype);
*/

//This section dictated a label that would showcase the volume number. Might need to be replaced by a slider.

/*
var volume = Titanium.UI.createLabel({
	text: "volume: "+Ti.Media.volume,
	bottom:50,
	color:'#999',
	textAlign:'center',
	width:'auto',
	height:'auto'
});

win.add(volume);

Ti.Media.addEventListener('linechange',function(e)
{
	linetype.text = "audio line type: "+lineTypeToStr();
});

Ti.Media.addEventListener('volume',function(e)
{
	volume.text = "volume: "+e.volume;
});
*/

//This is showcasing misc. information about the audio variables.

function showLevels()
{
	var peak = Ti.Media.peakMicrophonePower;
	var avg = Ti.Media.averageMicrophonePower;
	duration++;
	label.text = 'duration: '+duration+' seconds\npeak power: '+peak+'\navg power: '+avg;
}


var b1 = Titanium.UI.createButton({
	title:'Start Recording',
	width:200,
	height:40,
	top:20
});
b1.addEventListener('click', function()
{
	if (recording.recording)
	{
		file = recording.stop();
		b1.title = "Start Recording";
		b2.show();
		pause.hide();
		clearInterval(timer);
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
		b1.title = "Stop Recording";
		recording.start();
		b2.hide();
		pause.show();
		Ti.Media.startMicrophoneMonitor();
		duration = 0;
		timer = setInterval(showLevels,1000);
	}
});
win.add(b1);

//Pause button

var pause = Titanium.UI.createButton({
	title:'Pause recording',
	width:200,
	height:40,
	top:80
});
win.add(pause);
pause.hide();

pause.addEventListener('click', function() {
	if (recording.paused) {
		pause.title = 'Pause recording';
		recording.resume();
		timer = setInterval(showLevels,1000);
	}
	else {
		pause.title = 'Unpause recording';
		recording.pause();
		clearInterval(timer);
	}
});

var b2 = Titanium.UI.createButton({
	title:'Playback Recording',
	width:200,
	height:40,
	top:80
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

// Adding my own UPLOAD button to the Sound Record Section

var b3 = Titanium.UI.createButton({
	title:'Upload',
	width:200,
	height:40,
	top:140
});
win.add(b3);

b3.addEventListener('click', function()
{
	file  = recording.stop();
	//start.title = "Recorded: " + file.size;
	
	var xhr = Titanium.Network.createHTTPClient(); // Returns an instance of HTTPClient
	//The handling of network communication is handled asynchronously, since you would not want your application to hang while waiting on an HTTP request to return.
	
	xhr.onerror = function(e) //this fires if Titanium/the native SDK cannot successfully retrieve a resource
	{
		Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
		Titanium.API.info('In Error' + e.error);
	};
	xhr.setTimeout(20000);
	xhr.onload = function(e) //this fires when your request returns successfully
	{
		Titanium.UI.createAlertDialog({title:'Success', message:'status code' + this.status}).show();
		Titanium.API.info('In Onload' + this.status + 'readyState' + this.readyState);
	};
	xhr.onsendstream = function(e)
	{
		Titanium.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
	};
	
	xhr.open('POST', 'http://localhost/upload_audio.php', false); //false makes it synchronous
	//adding new content-type requests
	xhr.setRequestHeader("Content-Type", "audio/x-wav");
	
	//send the data
	xhr.send(file);
});

//

var switchLabel = Titanium.UI.createLabel({
	text:'Hi-fidelity:',
	width:'auto',
	height:'auto',
	textAlign:'center',
	color:'#999',
	bottom:115
});
var switcher = Titanium.UI.createSwitch({
	value:false,
	bottom:80
});

switcher.addEventListener('change',function(e)
{
	if (!switcher.value)
	{
		recording.compression = Ti.Media.AUDIO_FORMAT_ULAW;
	}
	else
	{
		recording.compression = Ti.Media.AUDIO_FORMAT_LINEAR_PCM;
	}
});
win.add(switchLabel);
win.add(switcher);
