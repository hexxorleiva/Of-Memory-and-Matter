//Changing the win to = Ti.Ui.currentWindow, just allowed me to declare anytime I wanted to modify something to appear in this window to just
//add "win." whatever else instead of having to write "Titanium.UI.currentWindow." then "add." over and over.
var win = Titanium.UI.currentWindow;

var isAndroid = false;
if (Titanium.Platform.name == 'android'){
	isAndroid = true;
}
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
				mapview.zoom(1);
			})
			zoomout.addEventListener('click',function() {
				mapview.zoom(-1);
			})
		}
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
	}
}

//
// Begin Geo Location
//

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

// Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters.
Titanium.Geolocation.distanceFilter = 10;

//This gets the current coordinates
var longitude = coords.longitude;
var latitude = coords.latitude;
var altitude = coords.altitude;
var heading = coords.heading;
var accuracy = coords.accuracy;
var speed = coords.speed;
var timestamp = coords.timestamp;
var altitudeAccuracy = coords.altitudeAccuracy;
var timestamp = coords.timestamp;

//This section builds the physical viewing map
var mapview = Titanium.Map.createView({
mapType: Titanium.Map.STANDARD_TYPE,

//This fires only ONCE.
Titanium.Geolocation.getCurrentPosition(function() {
        if (error) {
            Ti.API.log('error: ' + JSON.stringify(error) );
            return;
        }
		//The following are objects and need to have values placed. LatitudeDelta & LongitudeDelta have values set to be extremely close. The larger
		//the number, the larger the map will be.
		region: {latitude: latitude, longitude: longitude, latitudeDelta:0.001, longitudeDelta:0.001},    
		//The following are Booleans, so they can only be true or false
		animate:true,
		regionFit:true,
		userLocation:true,
		});
});

//This is the actual part that allows for the map to be viewed while having tabs at the bottom. Has to remain within the "TI.UI.Geolocation.getCurrentPosition"
//function in order to draw map at all, or does?
win.add(mapview);

mapview.addEventListener('regionChanged',function() {
	region: {latitude: latitude, longitude: longitude, latitudeDelta:0.001, longitudeDelta:0.001},
	userLocation:true,
	win.add(mapview);
	});