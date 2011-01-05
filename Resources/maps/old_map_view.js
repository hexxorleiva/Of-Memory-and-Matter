var isAndroid = false;
if (Titanium.Platform.name == 'android'){
	isAndroid = true;
}

var latitude = '';
var longitude = '';

Ti.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

// Set Distance filter. This dictates how often an event fires based on the distance
// the device moves. This value is in meters.
Titanium.Geolocation.distanceFilter = 7;

// Button bar

var bb2 = Titanium.UI.createButtonBar({
	labels:['Reset'],
	//backgroundColor:'maroon',
	//style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	bottom:0,
	left:0,
	height:25,
	width:'auto'
});

//This fires only ONCE.

Titanium.Geolocation.getCurrentPosition(function(e) {
        if (e.error) {
            Ti.API.log('error: ' + JSON.stringify(e.error) );
            return;
        }
 //This gets the current coordinates
	    var longitude = e.coords.longitude;
	    var latitude = e.coords.latitude;
	    var altitude = e.coords.altitude;
	    var heading = e.coords.heading;
	    var accuracy = e.coords.accuracy;
	    var speed = e.coords.speed;
	    var timestamp = e.coords.timestamp;
	    var altitudeAccuracy = e.coords.altitudeAccuracy;
		var timestamp = e.coords.timestamp;
//This section builds the physical viewing map	
	var mapview = Titanium.Map.createView({
		mapType: Titanium.Map.STANDARD_TYPE,
		//The following are objects and need to have values placed
		region: {latitude: latitude, longitude: longitude, latitudeDelta:0.001, longitudeDelta:0.001},    
//The following are Booleans, so they can only be true or false
		animate:true,
		regionFit:true,
		userLocation:true,
		});
//This is the actual part that allows for the map to be viewed while having tabs at the bottom
		Titanium.UI.currentWindow.add(mapview);
		Titanium.UI.currentWindow.add(bb2);
});


/*
Edited this out - Janurary 4tßh, 2010 - to see if I can add a button that will center to my current location like with Google Maps.

Titanium.Geolocation.addEventListener('location', function(e) {
        if (e.error) {
            Ti.API.log('error: ' + JSON.stringify(e.error) );
            return;
        }
else
{
	if (e.coords.timestamp<=500)
	{
		Titanium.UI.currentWindow.close(mapview);
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		
		Titanium.UI.currentWindow.add(mapview)
	}
}
		});
		*/

//win.add(mapview);
//win.open();
