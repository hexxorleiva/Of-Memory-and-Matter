var win = Titanium.UI.currentWindow;
//Added as this based on the set-up from oil reporter code on github
var audioSample = 'cricket.wav';
var file = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, audioSample);
//Added as this based on the set-up from oil reporter code on github
//This I think declares that a variable called "audio" contains within it the file referenced above to get the same from the "Resources" Folder
audio = file.read();

// load from file object
var sound = Titanium.Media.createSound({sound:file});

//Added as this based on the set-up from the oil reporter code on github
//I believe this is the syntax of declaring within JSON what the final upload blob will become with media and name being declarations.
var payload = {
	"media": audio,
	"name": audioSample
};

//
// PLAY
//
var play = Titanium.UI.createButton({
	title:'Play',
	height:40,
	width:145,
	left:10,
	top:10
});
play.addEventListener('click', function()
{
	sound.play();
	pb.max = sound.duration;
});
win.add(play);

//
// PAUSE
//
var pause = Titanium.UI.createButton({
	title:'Pause',
	height:40,
	width:145,
	right:10,
	top:10
});
pause.addEventListener('click', function()
{
	sound.pause();
});
win.add(pause);

//
// RESET
//
var reset = Titanium.UI.createButton({
	title:'Reset',
	height:40,
	width:145,
	left:10,
	top:60
});
reset.addEventListener('click', function()
{
	sound.reset();
	pb.value = 0;

});
win.add(reset);

//
// STOP
//
var stop = Titanium.UI.createButton({
	title:'Stop',
	height:40,
	width:145,
	right:10,
	top:60
});
stop.addEventListener('click', function()
{
	sound.stop();
	pb.value = 0;
});
win.add(stop);

//
// VOLUME +
//
var volumeUp = Titanium.UI.createButton({
	title:'Volume++',
	height:40,
	width:145,
	left:10,
	top:110
});

//
// VOLUME -
//
var volumeDown = Titanium.UI.createButton({
	title:'Volume--',
	height:40,
	width:145,
	right:10,
	top:110
});

volumeUp.addEventListener('click', function()
{
	if (sound.volume < 1.0)
	{
		sound.volume += 0.1;
		var roundedVolume = Math.round(sound.volume*1000)/1000;
		volumeUp.title = 'Volume++ (' + roundedVolume + ')';
		volumeDown.title = 'Volume--';
	}
});

volumeDown.addEventListener('click', function()
{
	if (sound.volume > 0)
	{
		if (sound.volume < 0.1) {
			sound.volume = 0;
		} else {
			sound.volume -= 0.1;
		var roundedVolume = Math.round(sound.volume*1000)/1000;
		volumeDown.title = 'Volume-- (' + roundedVolume + ')';
		volumeUp.title = 'Volume++';
		}
	}
});

win.add(volumeUp);
win.add(volumeDown);

//
// LOOPING
//
var looping = Titanium.UI.createButton({
	title:'Looping (false)',
	height:40,
	width:145,
	left:10,
	top:160
});
looping.addEventListener('click', function()
{
	sound.looping = (sound.looping==false)?true:false;
	looping.title = 'Looping (' + sound.looping + ')';
});
win.add(looping);

//
// Personal Upload Button
//
var upload = Titanium.UI.createButton({
	title:'Uploading',
	height:40,
	width:145,
	right:10,
	top:160
});
upload.addEventListener('click', function()
{
	var xhr = Titanium.Network.createHTTPClient(); // Returns an instance of HTTPClient
	//The handling of network communication is handled asynchronously, since you would not want your application to hang while waiting on an HTTP request to return.
	xhr.onerror = function(e) //this fires if Titanium/the native SDK cannot successfully retrieve a resource
	{
		Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
		Titanium.API.info('In Error' + e.error);
	};
	xhr.setTimeout(20000);
	
	xhr.onsendstream = function(e)
	{
		Titanium.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
	};

	xhr.onload = function(e) //this fires when your request returns successfully
	{
		Titanium.UI.createAlertDialog({title:'Success', message:'status code' + this.status}).show();
		Titanium.API.info('In Onload' + this.status + 'readyState' + this.readyState);
	};
	
	xhr.open('POST', 'http://localhost/upload_audio2.php', false); //false makes it synchronous
	xhr.setRequestHeader("Content-Type", "audio/x-wav");
	xhr.send(payload);
	
});
win.add(upload);


//
// EVENTS
//
sound.addEventListener('complete', function()
{
	pb.value = 0;
});
sound.addEventListener('resume', function()
{
	Titanium.API.info('RESUME CALLED');
});

//
//  PROGRESS BAR TO TRACK SOUND DURATION
//
var flexSpace = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
});
var pb = Titanium.UI.createProgressBar({
	min:0,
	value:0,
	width:200
});

if (Ti.Platform.name != 'android') {
	win.setToolbar([flexSpace,pb,flexSpace]);
}
pb.show();

//
// INTERVAL TO UPDATE PB
//
var i = setInterval(function()
{
	if (sound.isPlaying())
	{
		Ti.API.info('time ' + sound.time);
		pb.value = sound.time;

	}
},500);

//
//  CLOSE EVENT - CANCEL INTERVAL
//
win.addEventListener('close', function()
{
	clearInterval(i);
});