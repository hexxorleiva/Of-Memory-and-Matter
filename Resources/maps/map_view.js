//Changing the win to = Ti.Ui.currentWindow, just allowed me to declare anytime I wanted to modify something to appear in this window to just
//add "win." whatever else instead of having to write "Titanium.UI.currentWindow." then "add." over and over.
var win = Titanium.UI.currentWindow;

var isAndroid = false;
if (Titanium.Platform.name == 'android'){
	isAndroid = true;
}

//
// Begin Geo Location
//

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

// Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters.
Titanium.Geolocation.distanceFilter = 10;
		
		Titanium.Geolocation.addEventListener('location', function(e){
			if (e.error) {
		        Ti.API.log('error: ' + JSON.stringify(e.error) );
		        return;
		    }
			//This gets the current coordinates
			var current_longitude = e.coords.longitude;
			var current_latitude = e.coords.latitude;
			var current_altitude = e.coords.altitude;
			var current_heading = e.coords.heading;
			var current_accuracy = e.coords.accuracy;
			var current_speed = e.coords.speed;
			var current_timestamp = e.coords.timestamp;
			var current_altitudeAccuracy = e.coords.altitudeAccuracy;
			
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
		
		var mapview = Titanium.Map.createView({
			mapType: Titanium.Map.STANDARD_TYPE,
			//The following are booleans
			animate:true,
			regionFit:true,
			userLocation:true,
			// Latitude and Longitude Delta values are set for default zoom. They are in meters.
			region: {latitude: current_latitude, longitude: current_longitude, latitudeDelta:.001, longitudeDelta:.001},
		});

		win.add(mapview);

		});
