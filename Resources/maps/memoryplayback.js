// by default the modal window has a nav bar
// since we're embedding a navgroup inside the modal
// window which also has a nav bar, we ask him to hide it

var modal = Titanium.UI.createWindow({
	navBarHidden:true
});

var modalWin = Titanium.UI.createWindow({
	backgroundColor:"red"
});

var nav = Titanium.UI.iPhone.createNavigationGroup({
	window:modalWin
});

var table = Titanium.UI.createTableView({
	style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
	data:[{title:"Well look at this"},{title:"TweetDeck is cool"}]
});
modalWin.add(table);

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
