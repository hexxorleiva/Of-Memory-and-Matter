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
var tableView = Titanium.UI.createTableView({});
win.add(tableView);

var stream_url = [];
var audiourls = [];

//Audio
var streamer = Titanium.Media.createAudioPlayer();

//Buttons
var playButton;
var previousButton;
var nextButton;

//Global Variables
var incomingData;

//Off the top we need to create a connection to the server to make sure if there is any data to be created in the rows. So once the
//"getCurrentPosition()" fires, it will send a call to the server to get any coordinates that match and if they do, to return the audio
//url those coordinates are in line with.

// Get Current Position - This fires only once
Titanium.Geolocation.addEventListener('location', function(e){
		if (!e.success || e.error)
		{
			Titanium.UI.createAlertDialog('error ' + JSON.stringify(e.error));
			return;
		}
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
		for (var i = 0; i < incomingData.length; i++){
			CustomData = incomingData[i];
		
		// Create a vertical layout view to hold all the info
		var row = Titanium.UI.createTableViewRow({
			height:50
			});
		//This variable will denote the audio URL from AudioURL from MySQL database	
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
		//This variable will create the label that denotes Timestamp from MySQL database
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
		
		//Declare variable "stream_URL" as an array that when "while loop" continues to fill array with audio URL location
		var stream_url = CustomData.AudioURL;
		var dataTimestamp = CustomData.Timestamp;
			
			row.add(timeStamptext);
			row.add(audioText);
			row.className = 'audiourl';
			row.hasChild = CustomData.AudioURL;
			row.thisStream = stream_url;
			row.dataTimestamp = dataTimestamp;
			
			//audiourls = CustomData.AudioURL;			
			tableData.push(row); 
			
			}; //end of For loop
			tableView.setData(tableData);
		}; //end of onload
		xhr.send();
}); //end of getCurrentPosition

tableView.addEventListener('click', function(e){
	
	//When link is clicked
	Titanium.API.info('item index clicked :'+e.index);
	//Titanium.API.info(e.data);
	Ti.API.info("Row object  = "+e.row);
	Ti.API.info('http://localhost/'+e.rowData.thisStream);
	
	//When table view is hit, create a view that renders the rest of the options visible, but to focus on the
	//buttons bar at the bottom.
	
	//Done System Button
	var buttonDone = Titanium.UI.createButton({
	    systemButton:Titanium.UI.iPhone.SystemButton.DONE,
		right:50
	});
	
	win.setRightNavButton(buttonDone);
	
	//Create view that will block out the other Table options
	var view = Titanium.UI.createView({
		backgroundColor:'black',
		width: 320,
		height: 460,
		opacity: 0.8
	});
	
	win.add(view);
	
	var clearButton = Titanium.UI.createButton({
		width: 320,
		height: 460,
		opacity: 0.1
	});
	
	win.add(clearButton);
	
	//Add Play button
	playButton = Titanium.UI.createButton({
		title:'Play',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		enabled:true
		});
	//When Play button is hit, return this eventListener	
	playButton.addEventListener('click', function() {
		Ti.API.info('Clicked Play Button!');
		streamer.stop();
		streamer.url = 'http://localhost/'+e.rowData.thisStream;
		//'http://hectorleiva.com/media/2011-02-15-145044.mp3'
		streamer.start();
		});
	//Add Previous button 
	previousButton = Titanium.UI.createButton({
		title:'Previous',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		enabled:true
		});
	//When Previous button is hit, return this eventListener
	previousButton.addEventListener('click', function() {
		Titanium.API.info('Clicked Previous Button!');
		});
	//Add Next Button
	nextButton = Titanium.UI.createButton({
		title:'Next',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		enabled:true
		});
	//When Next button is hit, return this eventListener
	nextButton.addEventListener('click', function() {
		Titanium.API.info('Clicked Next Button!');
		});
	//Used to keep the buttons spaced apart equally
	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
	
	//This sets the toolbar at the button and locations of where the buttons are
	win.setToolbar([playButton,flexSpace,previousButton,flexSpace,nextButton], {translucent:true});
	/*
	streamer.stop();
	streamer.url = 'http://localhost/'+e.rowData.thisStream;
	//'http://hectorleiva.com/media/2011-02-15-145044.mp3'
	streamer.start();
	*/
	
	buttonDone.addEventListener('click', function(){
		Titanium.API.info('Pressed Done Button!');
		win.remove(view);
		win.setToolbar(null, {animated:true});
		buttonDone.hide();
		win.rightNavButton = null;
		clearButton.hide();
	});
	
	clearButton.addEventListener('click', function(){
		Titanium.API.info('Clicked Clear!');
		win.remove(view);
		streamer.stop();
		//Have to reset the window.Toolbar to "null" in order to hide it, and animate for "true" to make it flashy.
		win.setToolbar(null, {animated:true});
		win.remove(clearButton);
		buttonDone.hide();
		win.rightNavButton = null;
		clearButton.hide();
	});
	
});




//Established function to allow user know when last time refresh was pulled
function formatDate()
{
	var date = new Date;
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12)
	{
		datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
	}
	return datestr;
}

//This is the array that needs to be changed in order to accept the coordinates returned from the HTTPClient protocal

win.add(tableView);

var border = Ti.UI.createView({
	backgroundColor:"#576c89",
	height:2,
	bottom:0
});

var tableHeader = Ti.UI.createView({
	backgroundColor:"#e2e7ed",
	width:320,
	height:60
});

// fake it til ya make it..  create a 2 pixel
// bottom border
tableHeader.add(border);

var arrow = Ti.UI.createView({
	backgroundImage:"../images/whiteArrow.png",
	width:23,
	height:60,
	bottom:10,
	left:20
});

var statusLabel = Ti.UI.createLabel({
	text:"Pull to reload",
	left:55,
	width:200,
	bottom:30,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});

var lastUpdatedLabel = Ti.UI.createLabel({
	text:"Last Updated: "+formatDate(),
	left:55,
	width:200,
	bottom:15,
	height:"auto",
	color:"#576c89",
	textAlign:"center",
	font:{fontSize:12},
	shadowColor:"#999",
	shadowOffset:{x:0,y:1}
});

var actInd = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:13,
	width:30,
	height:30
});

tableHeader.add(arrow);
tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

tableView.headerPullView = tableHeader;

///////////////////////////////////////////////////////////////

var pulling = false;
var reloading = false;

function beginReloading()
{
	// just mock out the reload
	setTimeout(endReloading,2000);
}

///////////////////////////////////////////////////////////////

function tryToReload()
{
	Titanium.Geolocation.getCurrentPosition(function(e){
			if (!e.success || e.error)
			{
				currentLocation.text = 'error: ' + JSON.stringify(e.error);
				alert('error ' + JSON.stringify(e.error));
				return;
			}
			var longitude = e.coords.longitude;
			var latitude = e.coords.latitude;

			var geturl="http://localhost/comparecoodinates.php?latitude="+latitude+"longitude="+longitude;
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
			for (var i = 0; i < incomingData.length; i++){
				CustomData = incomingData[i];

			// Create a vertical layout view to hold all the info
			var row = Titanium.UI.createTableViewRow({
				height:50
				});
			//This variable will denote the audio URL from AudioURL from MySQL database	
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
			//This variable will create the label that denotes Timestamp from MySQL database
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

			//Declare variable "stream_URL" as an array that when "while loop" continues to fill array with audio URL location
			var stream_url = CustomData.AudioURL;

				row.add(timeStamptext);
				row.add(audioText);
				row.className = 'audiourl';
				row.hasChild = CustomData.AudioURL;
				row.thisStream = stream_url;

				//audiourls = CustomData.AudioURL;			
				tableData.push(row); 

				}; //end of For loop
				tableView.setData(tableData);
			}; //end of onload

			xhr.send();
	}); //end of getCurrentPosition

	/*
	// when you're done, just reset
	tableView.setContentInsets({top:0},{animated:true});
	reloading = false;
	lastUpdatedLabel.text = "Last Updated: "+formatDate();
	statusLabel.text = "Pull down to refresh...";
	actInd.hide();
	arrow.show();	*/
}

///////////////////////////////////////////////////////////////

function endReloading()
{
	tryToReload();
	// when you're done, just reset
	tableView.setContentInsets({top:0},{animated:true});
	reloading = false;
	lastUpdatedLabel.text = "Last Updated: "+formatDate();
	statusLabel.text = "Pull down to refresh...";
	actInd.hide();
	arrow.show();
}

///////////////////////////////////////////////////////////////

tableView.addEventListener('scroll',function(e)
{
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !pulling)
	{
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(-180);
		pulling = true;
		arrow.animate({transform:t,duration:180});
		statusLabel.text = "Release to refresh...";
	}
	else if (pulling && offset > -65.0 && offset < 0)
	{
		pulling = false;
		var t = Ti.UI.create2DMatrix();
		arrow.animate({transform:t,duration:180});
		statusLabel.text = "Pull down to refresh...";
	}
});

///////////////////////////////////////////////////////////////

tableView.addEventListener('scrollEnd',function(e)
{
	if (pulling && !reloading && e.contentOffset.y <= -65.0)
	{
		reloading = true;
		pulling = false;
		arrow.hide();
		actInd.show();
		statusLabel.text = "Reloading...";
		tableView.setContentInsets({top:60},{animated:true});
		arrow.transform=Ti.UI.create2DMatrix();
		beginReloading();
	}
});