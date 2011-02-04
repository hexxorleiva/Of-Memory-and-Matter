//Changing the win to = Ti.Ui.currentWindow, just allowed me to declare anytime I wanted to modify something to appear in this window to just
//add "win." whatever else instead of having to write "Titanium.UI.currentWindow." then "add." over and over.
var win = Titanium.UI.currentWindow;
var latitude;
var longitude;
var incomingData;
var recording;
var plotPoints;

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
/*
				var xhr = Titanium.Network.createHTTPClient();
				xhr.setTimeout(20000);
				xhr.open('GET', geturl, false); //http://localhost/gps_audio.php
				xhr.onerror = function(e)
				{
					Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
					Titanium.API.info('IN ERROR' + e.error);
				};
				xhr.onload = function(){
					Titanium.API.info(this.responseText);
				};
				xhr.send();*/
	});
 
win.add(mapView);

//I believe when the user changes their position, the map will follow them.
mapView.addEventListener('regionChanged', function(e) {
	latitude = e.latitude;
 	longitude = e.longitude;
});

//Might be redundant, but this is to change the longitude, latitude values when the user moves more tha 10 meters.
Titanium.Geolocation.addEventListener('location', function(e){	
	latitude = e.coords.latitude;
	longitude = e.coords.longitude;
	var geturl="http://localhost/getcoordinates.php?latitude="+latitude+"longitude="+longitude;
	Titanium.API.info(geturl);
// Begin the "Get data" request
	
		var xhr = Titanium.Network.createHTTPClient();
		xhr.setTimeout(20000);
		xhr.open('GET', geturl, false); //http://localhost/gps_audio.php
		xhr.onerror = function(e)
		{
			Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
			Titanium.API.info('IN ERROR' + e.error);
		};
		xhr.onload = function(){
			Titanium.API.info(this.responseText);
			incomingData = JSON.parse(this.responseText);
			for (var i = 0; i < incomingData.length; i++){
				recording = incomingData[i];
				var plotPoints = Titanium.Map.createAnnotation({
						latitude: recording.Latitude,
						longitude: recording.Longitude,
						pincolor:Titanium.Map.ANNOTATION_GREEN
					});
				//Titanium.API.info('Does ' + latitude + ' equal ' + recording.Latitude + ' or ' + longitude + ' equal ' + recording.Longitude);
			};
		};
		xhr.send();

		var updatedLocation = {
			latitude: e.coords.latitude,
			longitude: e.coords.longitude,
			animate:true,
			latitudeDelta:0.005,
			longitudeDelta:0.005,
			annotations:[plotPoints]
		};

		mapView.setLocation(updatedLocation);
		
	
});

	
				/*  NAV BAR - Looking at making a "Re-center" button and a "Zoom-in" and "Zoom-out" button for easier navigation
					For this to work I had to delete all the files already complied in the "build/iphone" folder within the project
					folder. I don't know why, but it made a clean rebuild and it started adding the bars and acknowledging the
					"Titanium.UI.iPhone" part of the code instead of declaring it "unknown".  */

				//I believe that these declare the variables without having them set to anything.
				var zoomin = null;
				var zoomout = null;

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
				win.setToolbar([flexSpace,zoomin,zoomout]);

		} else {
			var activity = Titanium.Android.currentActivity;
			activity.onCreateOptionsMenu = function() {
				var menu = e.menu;
				zoomin = menu.add({title : "Zoom In"});
				zoomout = menu.add({title : "Zoom Out"});
				wireClickHandlers();
			};
		};