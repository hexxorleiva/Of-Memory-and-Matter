/*

This javascript file will list any returned coordinates that are within range of the user's Latitude and Longitude. The tabelview
will be established and the data will be added as long as the user is within the threshold distance of another 'memory'. Afterwards
it will display the following information on each row.
**Memory
**Timestamp it was added (returns Datetime from MySQL)
Once it returns these values it will become a button that will start the audioplayer and play the returned audio url associated 
with those coordinates as a streaming element. It it important to note that it will not download it, because I want to avoid the 
user having the ability to listen to the audio whenever they wish.

*/
//Establishes the current window
var win = Titanium.UI.currentWindow;

//Establishes the Table
var tableData = [];
var CustomData = [];
var tableView = Titanium.UI.createTableView({minRowHeight:60});
win.add(tableView);

//Establishes the audio components
var stream_url = [];
var audiourls = [];

//Buttons
var reloadButton;

//Global Variables
var incomingData;
var longitude;
var latitude;

//Location Attributes
Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
// Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters.
Titanium.Geolocation.distanceFilter = 10;

//	Off the top we need to create a connection to the server to make sure if there is any data to be created in the rows. So once the
//	"getCurrentPosition()" fires, it will send a call to the server to get any coordinates that match and if they do, to return the audio
//	url those coordinates are in line with.

//
//	Create Table
//

function displayItems() {
	//	Clear the entire tableView
	tableView.setData([]);
	
	for (var i = 0; i < incomingData.length; i++){
	CustomData = incomingData[i];
	Titanium.API.info(CustomData.easytime);
	
	// Create a vertical layout view to hold all the info
	var row = Titanium.UI.createTableViewRow({
		hasChild:true
		});
	var easyTime = Titanium.UI.createLabel({
		text: CustomData.easytime,
		font: {fontSize:16,fontWeight:'bold'},
		width: 'auto',
		textAlign:'left',
		top: 10,
		left:10,
		color:'#333333'
		});
	//	This variable will denote the audio URL from AudioURL from MySQL database	
 	/*
var audioText = Titanium.UI.createLabel({
		text: CustomData.AudioURL,
		font: {fontSize:14,fontWeight:'bold'},
		width: 'auto',
		textAlign:'left',
		top: 7,
		height:12,
		left:10,
		color:'#333333'
		});
	//	This variable will create the label that denotes Timestamp from MySQL database
	var timeStamptext = Titanium.UI.createLabel({
		text: CustomData.Timestamp,
		font: {fontSize:12,fontWeight:'bold'},
		width: 'auto',
		textAlign:'left',
		top: 35,
		height:12,
		left:10,
		color:'#333333'
		});
	*/
	//	Declare variable "stream_URL" as an array that when "while loop" continues to fill array with audio URL location
	var stream_url = CustomData.AudioURL;
	var dataTimestamp = CustomData.Timestamp;
		
		//row.add(timeStamptext);
		//row.add(audioText);
		row.add(easyTime);
		row.className = 'audiourl'+i;
		row.thisStream = stream_url;
		row.dataTimestamp = dataTimestamp;
		//audiourls = CustomData.AudioURL;			
		tableView.appendRow(row,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.LEFT});
		//tableData.push(row);
		i++;
		}; //end of For loop
		
		//tableView.setData(tableData);
}; //end of function Display Items


//
//	Get Moving Location - This fires within every 10 meters
//
	
Titanium.Geolocation.addEventListener('location', function(e){
		if (!e.success || e.error)
		{
			Titanium.UI.createAlertDialog('error ' + JSON.stringify(e.error));
			return;
		}
		//	Clear the entire table view
		tableView.setData([]);
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		
		var geturl="http://localhost/getallaudio.php?latitude="+latitude+"longitude="+longitude; //comparecoordinates.php
		//Titanium.API.info(geturl);
		// Begin the "Get data" request
		var xhr = Titanium.Network.createHTTPClient();
		xhr.setTimeout(20000);
		xhr.open('GET', geturl, false);
		xhr.onerror = function(e)
			{
			Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
			Titanium.API.info('IN ERROR' + e.error);
					};
		///////////////////////////////////////////////////////////////////
		xhr.onload = function(){
		Titanium.API.info(this.responseText);
		incomingData = JSON.parse(this.responseText);
		displayItems(incomingData);
		
		}; //end of onload
		xhr.send();
}); //end of geolocation

//
//	Reload Button
//

	reloadButton = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REFRESH,
		right:50
	});
	win.setRightNavButton(reloadButton);
	
	reloadButton.addEventListener('click', function() {
		
		Titanium.Geolocation.getCurrentPosition(function(e){
				if (!e.success || e.error)
				{
					Titanium.UI.createAlertDialog('error ' + JSON.stringify(e.error));
					return;
				}
				tableView.setData([]);
				longitude = e.coords.longitude;
				latitude = e.coords.latitude;

				var geturl="http://localhost/getallaudio.php?latitude="+latitude+"longitude="+longitude; //comparecoordinates.php
				//Titanium.API.info(geturl);
				// Begin the "Get data" request
				var xhr = Titanium.Network.createHTTPClient();
				xhr.setTimeout(20000);
				xhr.open('GET', geturl, false);
				xhr.onerror = function(e)
					{
					Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
					Titanium.API.info('IN ERROR' + e.error);
							};
				///////////////////////////////////////////////////////////////////
				xhr.onload = function(){
				Titanium.API.info(this.responseText);
				incomingData = JSON.parse(this.responseText);
				displayItems(incomingData);
				}; //end of onload
				xhr.send();
		}); //end of geolocation
		Titanium.API.info('Reload Button has been pressed!');
	});

//
//	TableView Event Listener
//

tableView.addEventListener('click', function(e){

	Titanium.API.info('item index clicked :'+e.index);
	Ti.API.info("Row object  = "+e.row);
	Ti.API.info('http://localhost/'+e.rowData.thisStream);
	
	//When table view is hit, create a view that renders the rest of the options visible, but to focus on the
	//buttons bar at the bottom.
	
	//
	//	Done System Button
	//
	var buttonDone = Titanium.UI.createButton({
	    systemButton:Titanium.UI.iPhone.SystemButton.DONE,
		right:50
	});
	win.setRightNavButton(buttonDone);
	
	//	Create view that will block out the other Table options
	var view = Titanium.UI.createView({
		backgroundColor:'black',
		width: 320,
		height: 460,
		opacity: 0.9
	});
	win.add(view);
	
	//	Create Sound Player
	var soundPlayer = Titanium.Media.createSound({url: 'http://localhost/' + e.rowData.thisStream, preload:true});
	var progressBar = Titanium.UI.createProgressBar({
		min:0,
		value:0,
		width:200
	});
	progressBar.show();
	
	//	Used to keep the buttons spaced apart equally
	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
	
	//
	//	Buttons
	//
	
	//	Add Play button
	var playButton = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.PLAY,
		left:30,
		enabled:true
		});
		
	//	When Play button is hit, return this eventListener	
	playButton.addEventListener('click', function() {
		Ti.API.info('Clicked Play Button!');
		soundPlayer.stop();
		progressBar.value = 0;
		soundPlayer.play();
		progressBar.max = soundPlayer.duration;
		});
		
	//	Add Rewind button
	var rewindButton = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REWIND,
		left:50,
		enabled:true
	});
	
	rewindButton.addEventListener('click', function() {
		Titanium.API.info('Clicked Rewind Button!');
		soundPlayer.stop();
		progressBar.value=0;
	});
	
	var i = setInterval(function()
	{
		if (soundPlayer.isPlaying())
		{
			Ti.API.info('time ' + soundPlayer.time);
			progressBar.value = soundPlayer.time;

		}
	},500);
	
	//	Event Listeners from within TableView Listener
	
	//
	//  CLOSE EVENT - CANCEL INTERVAL
	//
	win.addEventListener('close', function()
	{
		clearInterval(i);
	});
	
	//
	//	SOUNDPLAYER - COMPLETE SOUND FILE
	//
	soundPlayer.addEventListener('complete', function(){
		Titanium.API.info('Complete Called');
		progressBar.value = 0;
	});
	
	//
	//	WHEN 'DONE' BUTTON IS PRESSED
	//
	buttonDone.addEventListener('click', function(){
		Titanium.API.info('Pressed Done Button!');
		win.remove(view);
		win.setToolbar(null, {animated:true});
		buttonDone.hide();
		win.rightNavButton = null;
		win.setRightNavButton(reloadButton);
	});
	
	//	This sets the toolbar at the button and locations of where the buttons are
	win.setToolbar([playButton,rewindButton,flexSpace,progressBar], {translucent:true});
	
});