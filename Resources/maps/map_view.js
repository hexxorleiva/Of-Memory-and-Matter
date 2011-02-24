/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	The following script showcases the Map Google API and current position of the user.							  //
//	There is also a listener event that will change the way the map behaves in accordance to					  //
//	the GPS location of the user by shifting the view to their location on "eventListener('location')"			  //
//																												  //
//	The PHP script will update the annotations on the map of the most up to date locations of other recordings.   //
//																												  //
//	Hector Leiva - 2011																							  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
//	Globally Declared Variables
//

//	Decalres the scope of the window to be drawn within the selected tab that redirected here.
var win = Titanium.UI.currentWindow;

//	The coordinate variables that will constantly change throughout eventlisteners inside the script
var latitude;
var longitude;

//	Variables that are needed to accept the incoming JSON data and create arrays needed to make map annotations
var incomingData;
var recorded = [];
var plotPoints;
var updateAnnotations;
var uploadGPS = '';
var annotations = [];

var isAndroid = false;
if (Titanium.Platform.name == 'android'){
	isAndroid = true;
}

//
//	Begin Geo Location
//

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
//	Set Distance filter. This dictates how often an event fires based on the distance the device moves. This value is in meters. 275 meters = 900 feet.
Titanium.Geolocation.distanceFilter = 275;

//	Start by creating the Map with these current coordinates, these being specific for Baltimore, Maryland.
var mapView = Titanium.Map.createView({
    mapType: Titanium.Map.STANDARD_TYPE,
    animate:true,
    region: {latitude:39.30109620906199, longitude:-76.60234451293945, latitudeDelta:0.001, longitudeDelta:0.001}, //latitude:39.30109620906199 longitude:-76.60234451293945
    regionFit:true,
    userLocation:true,
    visible: true
});

//	This function will run though the 'annotations' array() and remove them from the mapView. Then will set them to an empty array.
function removeAnnotations(){
    for (i=annotations.length-1;i>=0;i--) {
        mapView.removeAnnotation(annotations[i]);
    }
    annotations = [];
}

//	This will redraw the mapView map, whenever the user changes regions.
mapView.addEventListener('regionChanged', function(e) {
	var latitude = e.latitude;
 	var longitude = e.longitude;
  	var latitudeDelta = e.latitudeDelta;
  	var longitudeDelta = e.longitudeDelta;

	//	Remove any previously set up annotations
	removeAnnotations();
	//	Contact server
	//var geturl='http://localhost/mappingcoordinates.php?latitude=' + latitude + '&longitude=' + longitude;
	Titanium.API.info('Region Changed: ' + geturl);
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.setTimeout(20000);
	xhr.open('GET', geturl, false);
	xhr.onerror = function()
		{
		Titanium.UI.createAlertDialog({title:'Sorry!', message:'It seems that the server is busy, please wait.'}).show();
		Titanium.API.info('IN ERROR' + e.error);
				};
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//	Upon getting a server response, the function will make that response equal to an array and run through the array until the response is empty.	 //
	//	For each latitude and longitude value that is returned from the server, they will be a latitude and longitude value to set for the annotations.	 //
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	xhr.onload = function(){
	Titanium.API.info('From Map_view.js: ' + this.responseText);
	incomingData = JSON.parse(this.responseText);
	for (var i = 0; i < incomingData.length; i++){
	recorded = incomingData[i];
		plotPoints = Titanium.Map.createAnnotation({
		latitude: recorded.Latitude,
		longitude: recorded.Longitude,
		title: 'Memory',
		pincolor: Titanium.Map.ANNOTATION_GREEN,
		animate:true
				});
	mapView.addAnnotation(plotPoints);
	annotations.push(plotPoints);
			}; // end of for loop
	}; // end of xhr.onload()
	xhr.send();
});

///////////////////////////////////////////////////////////////////////

//
//	If location changes within 100m in any direction. Grab current coordinates, send HTTPClient request to server and redraw Map Annotations, update Map with annotations.
//

Titanium.Geolocation.addEventListener('location', function(e){
	
	//	With the Geolocation triggered from a change in 275 meters, Geolocation will find out the user's coordinates and set them to the global variables.
	latitude = e.coords.latitude; 
	longitude = e.coords.longitude;
	
	//	This variable will be set to react to the new region. This includes the updated Latitude and Longitude coordinate of the user and to 'animate' to the new location.
	//	The delta values will affect how 'zoomed' the map will reset itself for the user.
	var updatedLocation = {
			latitude: e.coords.latitude,
			longitude: e.coords.longitude,
			animate:true
			//latitudeDelta:0.005,
			//longitudeDelta:0.005
			};
		mapView.setLocation(updatedLocation);
});

win.add(mapView);
	
				/*  NAV BAR - Looking at making a "Re-center" button and a "Zoom-in" and "Zoom-out" button for easier navigation
					For this to work I had to delete all the files already complied in the "build/iphone" folder within the project
					folder. I don't know why, but it made a clean rebuild and it started adding the bars and acknowledging the
					"Titanium.UI.iPhone" part of the code instead of declaring it "unknown".  */
//	Have the navigation buttons set to nothing
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
