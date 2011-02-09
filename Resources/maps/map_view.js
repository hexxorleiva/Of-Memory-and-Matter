//Changing the win to = Ti.Ui.currentWindow, just allowed me to declare anytime I wanted to modify something to appear in this window to just
//add "win." whatever else instead of having to write "Titanium.UI.currentWindow." then "add." over and over.
var win = Titanium.UI.currentWindow;

/*function openWindow( option, transition ){
	var curwin = Titanium.UI.currentWindow;
	if ( curwin && transition ){
		curwin.close({transition: transition});
	}
	Titanium.App.fireEvent('openwindow', {option:option});
}*/

var latitude;
var longitude;
var incomingData;
var recorded = [];
var plotPoints;
var updateAnnotations;

var isAndroid = false;
if (Titanium.Platform.name == 'android'){
	isAndroid = true;
}
/*
The following script showcases the Map Google API and current position of the user.
There is also a listener event that will change the way the map behaviors in accordance to
the GPS location of the user by shifting the view to their location on "eventListener('location')"

Will be adding a PHP script that will update the annotations on the map of the most up to date locations
of other recordings. 
*/

//
// Begin Geo Location
//

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
// Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters.
Titanium.Geolocation.distanceFilter = 10;

// Start by creating the Map with these current coordinates
var mapView = Titanium.Map.createView({
    mapType: Titanium.Map.STANDARD_TYPE,
    animate:true,
    region: {latitude:39.30109620906199, longitude:-76.60234451293945, latitudeDelta:0.1, longitudeDelta:0.1}, //latitude:39.30109620906199 longitude:-76.60234451293945
    regionFit:true,
    userLocation:true,
    visible: true
});
 
//THIS ONLY FIRES ONCE, ASYNC MEANING IT RUNS AND THEN EXISTS AND WON'T COME BACK. Gets the user's current location.
Titanium.Geolocation.getCurrentPosition(function(e){
        var region={
            latitude: e.coords.latitude,
            longitude: e.coords.longitude,
            animate:true,
            latitudeDelta:0.005,
            longitudeDelta:0.005
        };
        mapView.setLocation(region);

			var latitude = e.coords.latitude;
			var longitude = e.coords.longitude;
			var geturl="http://localhost/getcoordinates.php?latitude="+latitude+"longitude="+longitude;
			Titanium.API.info(geturl);
			// Begin the "Get data" request
			var xhr = Titanium.Network.createHTTPClient();
			xhr.setTimeout(20000);
			xhr.open('GET', geturl, false);
			xhr.onerror = function(e)
				{
				Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
				Titanium.API.info('IN ERROR' + e.error);
				};
			xhr.onload = function(){
			Titanium.API.info(this.responseText);
			incomingData = JSON.parse(this.responseText);
			for (var i = 0; i < incomingData.length; i++){
			recorded = incomingData[i];
			Titanium.API.info(recorded.Latitude);
			Titanium.API.info(recorded.Longitude);
				plotPoints = Titanium.Map.createAnnotation({
				latitude: recorded.Latitude,
				longitude: recorded.Longitude,
				title: 'Memory',
				pincolor: Titanium.Map.ANNOTATION_GREEN,
				animate:true
				});
			mapView.addAnnotation(plotPoints);
			}; // end of for loop
		}; // end of xhr.onload()
		xhr.send();
	});
 
win.add(mapView);

//I believe when the user changes their position, the map will follow them.
mapView.addEventListener('regionChanged', function(e) {
	latitude = e.latitude;
 	longitude = e.longitude;
});

/*


Titanium.Geolocation.addEventListener('location', function(e){	
	latitude = e.coords.latitude;
	longitude = e.coords.longitude;
	var coordinateDifference = [];
	
	var currentCoordinates = { "currentcoords": [
				   {"latitude": latitude,
				   "longitude": longitude}]
						};
	var uploadCurrentGPS = JSON.stringify(currentCoordinates); 
	var updatedLocation = {
			latitude: e.coords.latitude,
			longitude: e.coords.longitude,
			animate:true,
			latitudeDelta:0.005,
			longitudeDelta:0.005
		};
	var geturl="http://localhost/getcoordinates.php?latitude="+latitude+"longitude="+longitude;
	Titanium.API.info(geturl);
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
	recorded = incomingData[i];
	Titanium.API.info(recorded.Latitude);
	Titanium.API.info(recorded.Longitude);
		plotPoints = Titanium.Map.createAnnotation({
		latitude: recorded.Latitude,
		longitude: recorded.Longitude,
		title: 'Memory',
		pincolor: Titanium.Map.ANNOTATION_GREEN,
		animate:true
				});
	mapView.addAnnotation(plotPoints);	
	//Here is where it will try and calculate the distance and within a certain radius it will send a POST to the server to retrieve the audio url from the database.
	var latitudeDifference = recorded.Latitude - latitude;
	var longitudeDifference = recorded.Longitude - longitude;
	var distanceCalculated = sqrt(Math.pow(latitudeDifference,2) + Math.pow(longitudeDifference,2));
	if (distanceCalculated <= Math.pow(2.49, -5)) {
		coordinateDifference = distanceCalculated;
		} else { coordinateDifference = ''; }; // If/Else end statement
		}; // end of for loop
	}; // end of xhr.onload()
	////////////////////////////////////////////////////////////////
	//Couldn't at this point there be a return value of the "receieved.Latitude" & "receieved.Longitude" so the server doesn't have to do these math exercises also?
	//Just return the longitude and latitude values that made the coordinateDifference happen in the first place and then make the server just match those values
	//with the audio url and play it. A "SELECT FROM audiourl WHERE latitude && longitude == receieved.latitude && receieved.longitude"
	if(coordinateDifference != null){
	xhr.setTimeout(20000);
	xhr.open('POST', "http://localhost/comparecoordaintes.php", false);
	xhr.onerror = function(e)
		{
		Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
		Titanium.API.info('IN ERROR' + e.error);
				};
	xhr.onload = function()
		{
		//Receieve the audio url and read it through Titanium
		Titanium.API.info(this.responseText);
		//Have variable "streamingAudioURL" equal the incoming echo from php script.
		streamingAudioURL = JSON.parse(this.responseText);
		//Begins the player.
		var streamer = Titanium.Media.createAudioPlayer();
		
		//have audio player play back url received from server
			};
	xhr.onsendstream = function(e)
		{
		Titanium.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
			};
//		xhr.setRequestHeader("Content-Type", "gps/json");
//		xhr.send(uploadCurrentGPS);
}; // end of If statement		
		
	
	mapView.setLocation(updatedLocation);
});

*/

	
				/*  NAV BAR - Looking at making a "Re-center" button and a "Zoom-in" and "Zoom-out" button for easier navigation
					For this to work I had to delete all the files already complied in the "build/iphone" folder within the project
					folder. I don't know why, but it made a clean rebuild and it started adding the bars and acknowledging the
					"Titanium.UI.iPhone" part of the code instead of declaring it "unknown".  */

				//I believe that these declare the variables without having them set to anything.
				var zoomin = null;
				var zoomout = null;
				var testbutton = null;
				
				/*I have no idea what the "wireClickHandlers" function is suppose to do; I copied this code from the Maps example
				  from the Titanium Appcelerator KitchenSink. I think these just make the "zoom" variables become functions that
				  affect the mapview - and that the "mapview.zoom" part actually details how it changes the map itself.*/

				var wireClickHandlers = function() {
					zoomin.addEventListener('click',function() {
						mapView.zoom(1);
					});
					zoomout.addEventListener('click',function() {
						mapView.zoom(-1);
					});
					
				};
			  /* This statement is just in place because the "remove all" button (from the Maps example in the Kitchen Sink) won't work on the Android
				 phone as is and needs to be adjusted. So (!isAndroid) = if it isn't the Android OS do the following. It was important to place anyways
				because below, the zoom-in and zoom-out buttons need to have a different method. It is "menu.add" with a title. */
		if (!isAndroid) {
				var flexSpace = Titanium.UI.createButton({
					systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
				});
				
				testbutton = Titanium.UI.createButton({
					title: 'Testing',
					style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
				});

				zoomin = Titanium.UI.createButton({
					title:'Zoom +',
					style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
				});

				zoomout = Titanium.UI.createButton({
					title:'Zoom -',
					style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
				});

				wireClickHandlers();
				/* The usage of "flexspace" below fills in the gaps. Since I placed a "flexspace" before the other identified buttons, it pushed those
				   buttons all the way to the right. If I wanted to add another button for any reason, just make sure to identify it and then determine
				   how much spacing is wanted. */
				win.setToolbar([flexSpace,zoomin,zoomout, testbutton]);

		} else {
			var activity = Titanium.Android.currentActivity;
			activity.onCreateOptionsMenu = function() {
				var menu = e.menu;
				zoomin = menu.add({title : "Zoom In"});
				zoomout = menu.add({title : "Zoom Out"});
				wireClickHandlers();
			};
		};
		
		testbutton.addEventListener('click', function(){
			var newwin = Titanium.UI.createWindow({url:'memoryplayback.js',
			backgroundColor:'Grey',
			fullscreen:true});
			newwin.open();
			});
