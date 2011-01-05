var win = Titanium.UI.currentWindow;

var isAndroid = false;
if (Titanium.Platform.name == 'android'){
	isAndroid = true;
}

var latitude = '';
var longitude = '';

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

// Set Distance filter. This dictates how often an event fires based on the distance
// the device moves. This value is in meters.
Titanium.Geolocation.distanceFilter = 7;

//
// NAVBAR BUTTONS
//

var removeAll = null;
var atl = null;
var sv = null;
var sat = null;
var std = null;
var hyb = null;
var zoomin = null;
var zoomout = null;
		
var wireClickHandlers = function() {
	removeAll.addEventListener('click', function() {
		mapview.removeAllAnnotations();
	});

	atl.addEventListener('click', function() {
		// set location to atlanta
		mapview.setLocation(regionAtlanta);
	
		// activate annotation
		mapview.selectAnnotation(mapview.annotations[0].title,true);
		Ti.API.error("CLICKED ATL");
	});
	
	sv.addEventListener('click', function() {
		Ti.API.info('IN SV CHANGE');
		// set location to sv
		mapview.setLocation(regionSV);
	
		// activate annotation
		mapview.selectAnnotation(mapview.annotations[1].title,true);
	});
	
	sat.addEventListener('click',function() {
		// set map type to satellite
		mapview.setMapType(Titanium.Map.SATELLITE_TYPE);
	});
	
	std.addEventListener('click',function() {
		// set map type to standard
		mapview.setMapType(Titanium.Map.STANDARD_TYPE);
	});
	
	hyb.addEventListener('click',function() {
		// set map type to hybrid
		mapview.setMapType(Titanium.Map.HYBRID_TYPE);
	});
	
	zoomin.addEventListener('click',function() {
		mapview.zoom(1);
	});
	
	zoomout.addEventListener('click',function() {
		mapview.zoom(-1);
	});
}		

if (!isAndroid) {
	removeAll = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'Remove All'
	});
	win.rightNavButton = removeAll;

	//
	// TOOLBAR BUTTONS
	//
	
	// button to change to ATL
	atl = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'ATL'
	});
	// activate annotation
	mapview.selectAnnotation(mapview.annotations[0].title,true);
	
	// button to change to SV	
	sv = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'SV'
	});
	mapview.addEventListener('complete', function()
	{
		Ti.API.info("map has completed loaded region");
	});
	
	
	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	
	// button to change map type to SAT
	sat = Titanium.UI.createButton({
		title:'Sat',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	// button to change map type to STD
	std = Titanium.UI.createButton({
		title:'Std',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	// button to change map type to HYBRID
	hyb = Titanium.UI.createButton({
		title:'Hyb',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	// button to zoom-in
	zoomin = Titanium.UI.createButton({
		title:'+',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	// button to zoom-out
	zoomout = Titanium.UI.createButton({
		title:'-',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	
	wireClickHandlers();
	
	win.setToolbar([flexSpace,std,flexSpace,hyb,flexSpace,sat,flexSpace,atl,flexSpace,sv,flexSpace,zoomin,flexSpace,zoomout,flexSpace]);
} else {
	var activity = Ti.Android.currentActivity;
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		
		atl = menu.add({title : 'ATL'});
		sv = menu.add({title : 'SV'});
		sat = menu.add({title : 'Sat'});
		std = menu.add({title : 'Std'});
		hyb = menu.add({title : 'Hyb'});
		zoomin = menu.add({title : "Zoom In"});
		zoomout = menu.add({title : 'Zoom Out'});
		removeAll = menu.add({title:'Remove All'});
		
		wireClickHandlers();
	}
}


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
		//The following are objects and need to have values placed. LatitudeDelta & LongitudeDelta have values set to be extremely close. The larger
		//the number, the farther away it will be on the map.
		region: {latitude: latitude, longitude: longitude, latitudeDelta:0.001, longitudeDelta:0.001},    
		//The following are Booleans, so they can only be true or false
		animate:true,
		regionFit:true,
		userLocation:true,
		});
		//This is the actual part that allows for the map to be viewed while having tabs at the bottom
		win.add(mapview);
});



Titanium.Geolocation.addEventListener('location', function(e) {
        if (e.error) {
            Ti.API.log('error: ' + JSON.stringify(e.error) );
            return;
        }
else
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
		
		win.add(mapview)
}
		});

//win.add(mapview);
//win.open();
