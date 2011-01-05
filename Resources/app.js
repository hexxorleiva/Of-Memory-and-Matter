// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup({id:'tabGroup1'});


//
// create base UI tab and root window
//

//
// create controls tab and root window
//
var win1 = Titanium.UI.createWindow({
	id:'win1',
	url:'subfolder/scroll_views_scrollable.js',
    title:'Introduction',
    backgroundColor:'#000'
});
var tab1 = Titanium.UI.createTab({
	id:'tab1',  
    icon:'KS_nav_ui.png',
    title:'Introduction',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	id:'label1',
	color:'#fff',
	text:'Introduction',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});
win1.add(label1);


//
//

var win2 = Titanium.UI.createWindow({
	id:'win2',
	url:'maps/map_view.js',
	title:'Map',
	backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({
	id:'tab2',
	icon:'KS_nav_ui.png',
	title:'Map',
	window:win2
});

var label2 = Titanium.UI.createLabel({
	id:'label2',
	color:'#999',
	font:{fontSize:16,fontfamily:'Helvetica Neue'},
	textAlign:'center',
	width: 300
});

win2.add(label2);

//
//

var win3 = Titanium.UI.createWindow({
	id:'win3',
	url:'subfolder/sound_record.js',
	title:'Recording Sound',
	backgroundColor:'#fff'
});
var tab3 = Titanium.UI.createTab({
	id:'tab3',
	icon:'KS_nav_ui.png',
	title:'Record Sound',
	window:win3
});

var label3 = Titanium.UI.createLabel({
	id:'label3',
	color:'#999',
	text:'Sound',
	font:{fontSize:15,fontfamily:'Helvetica Neue'},
	textAlign:'center',
	width: 300	
});

win3.add(label3);

//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);


// open tab group
tabGroup.open();