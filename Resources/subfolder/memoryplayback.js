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
var CustomData = [{ title:"Please wait."}];
var tableView = Titanium.UI.createTableView({
	data: tableData,
	style:Titanium.UI.iPhone.TableViewStyle.GROUPED
	});
win.add(tableView);

//Global Variables
var incomingData;

//Off the top we need to create a connection to the server to make sure if there is any data to be created in the rows. So once the
//"getCurrentPosition()" fires, it will send a call to the server to get any coordinates that match and if they do, to return the audio
//url those coordinates are in line with.

// Get Current Position - This fires only once
Titanium.Geolocation.getCurrentPosition(function(e){
		if (!e.success || e.error)
		{
			currentLocation.text = 'error: ' + JSON.stringify(e.error);
			alert('error ' + JSON.stringify(e.error));
			return;
		}
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		
		var geturl="http://localhost/getallaudio.php?latitude="+latitude+"longitude="+longitude;
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
			//Titanium.API.info(jsonData.Timestamp);
			//Titanium.API.info(incomingData[i].AudioURL);
			CustomData = incomingData[i];
			Titanium.API.info(CustomData.AudioURL);
		
		// Create a vertical layout view to hold all the info
		var row = Titanium.UI.createTableViewRow({height:50});
	 	var audioText = Titanium.UI.createLabel({
			text: CustomData.AudioURL,
			font: {fontSize:12,fontWeight:'bold'},
			width: 'auto',
			textAlign:'left',
			height:12,
			left:10,
			color:'#333333'
			});
			
			
			row.add(audioText);
			row.className = 'audiourl';
			row.hasChild=CustomData.hasChild;
			tableData.push(row); 
			
			}; //end of For loop
			tableView.setData(tableData);
		}; //end of onload
		
		xhr.send();
}); //end of getCurrentPosition


/*

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

var lastRow = 4;


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


var pulling = false;
var reloading = false;

function beginReloading()
{
	// just mock out the reload
	setTimeout(endReloading,2000);
}

function endReloading()
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

			var geturl="http://localhost/getallaudio.php?latitude="+latitude+"longitude="+longitude;
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
						jsonData = incomingData[i];
						//Titanium.API.info(jsonData.Timestamp);
						Titanium.API.info(jsonData.AudioURL);

					var row = Titanium.UI.createTableViewRow();

					var audioURLText = Titanium.UI.createLabel({
						text:jsonData.AudioURL,
						font:{fontSize:12,fontWeight:'bold'},
						top:2,
						left:20,
						width:'auto',
						textAlign:'left'
						//className: 'tableLeft'
						});
						row.add(audioURLText);
						//row.className = 'audiourl';
						//row.hasChild=jsonData.hasChild;
						tableData.push(row);
						}; //end of For loop
					}; //end of onload

					xhr.send();
			}); //end of getCurrentPosition

	// simulate loading

	for (var c=lastRow;c<lastRow+10;c++)
	{
		tableView.appendRow({title:"Row "+c});
	}
	lastRow += 10;


	// when you're done, just reset
	tableView.setContentInsets({top:0},{animated:true});
	reloading = false;
	lastUpdatedLabel.text = "Last Updated: "+formatDate();
	statusLabel.text = "Pull down to refresh...";
	actInd.hide();
	arrow.show();
}

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

*/