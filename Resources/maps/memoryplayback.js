// by default the modal window has a nav bar
// since we're embedding a navgroup inside the modal
// window which also has a nav bar, we ask him to hide it
var longitude;
var latitude;


var modal = Titanium.UI.createWindow({
	navBarHidden:true
});

var modalWin = Titanium.UI.createWindow({
});

// Text detail for Title in Toolbar
var titleLabel = Titanium.UI.createLabel({
	color:'#fff',
	text:'Memory Record',
	textAlign: 'center',
	font:{fontSize:20}
});

modalWin.setTitleControl(titleLabel);

var nav = Titanium.UI.iPhone.createNavigationGroup({
	window:modalWin
});

Titanium.Geolocation.getCurrentPosition(function(e){
		if (!e.success || e.error)
		{
			currentLocation.text = 'error: ' + JSON.stringify(e.error);
			alert('error ' + JSON.stringify(e.error));
			return;
		}
		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
});

//
//XHR request for server numbers
//

var xhr = Titanium.Network.createHTTPClient();
xhr.setTimeout(20000);
xhr.open('GET', "http://localhost/comparecoordaintes.php?latitude="+latitude+"longitude="+longitude, false);
xhr.onerror = function(e)
{
Titanium.UI.createAlertDialog({title:'Error', message:e.error}).show();
Titanium.API.info('IN ERROR' + e.error);
		};
xhr.onload = function()
{
//Receieve the audio url and read it through Titanium
Titanium.API.info(this.responseText);
////Have variable "streamingAudioURL" equal the incoming echo from php script.
//streamingAudioURL = JSON.parse(this.responseText);
////Begins the player.
//var streamer = Titanium.Media.createAudioPlayer();

//have audio player play back url received from server
	};
xhr.onsendstream = function(e)
{
Titanium.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
	};

//
// Data Table Values
//


var table = Titanium.UI.createTableView({
	style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
	data:[{title:"Well look at this"},{title:"TweetDeck is cool"}],
	backgroundColor:'#fff'
});
modalWin.add(table);

//
// Done - button
//

var done = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.DONE
});

modalWin.setRightNavButton(done);
done.addEventListener('click',function()
{
	modal.close();
	Titanium.UI.currentWindow.close();
});

table.addEventListener('click',function(e)
{
	var b = Titanium.UI.createButton({
		title:'Back (no anim)',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	b.addEventListener('click', function() {
		nav.close(w,{animated:false});
	});
	var w = Titanium.UI.createWindow({
		title:e.rowData.title,
		rightNavButton:b
	});
	w.addEventListener('focus',function()
	{
		Ti.API.info("nav group window -- focus event");
	});
	w.addEventListener('blur',function()
	{
		Ti.API.info("nav group window -- blur event");
	});
	var b2 = Titanium.UI.createButton({
		title:"Close Nav",
		width:120,
		height:40
	});
	b2.addEventListener('click',function()
	{
		nav.close();
		modal.close();
	});
	w.add(b);
	w.add(b2);
	nav.open(w);
});

modal.add(nav);
modal.open({modal:true});
