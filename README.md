```
This repository has been moved to http://modeln.github.com/sDashboard
```

sDashboard
==========

A simple &amp; light weight dashboard framework in javascript

##Description

sDashboard is a jQuery plugin that converts an array of objects into a dashboard. Each object in the array would be rendered as a dashboard widget that can be rearranged by dragging around.

sDashboards has built in support for rendering  datatable's and flotr2 charts.  It also has support to listen for events such as table row click, chart data click and data selection built-in.


##Demo

view an example at : [example](http://niki4810.github.com/sDashboard/example/example.html)


##Features

The current version of the dashboard includes the following features

Current version : V2.0 (aka Salt&Pepper)

* Full support for all Flort2 charts.
* Support for chart click and selection
* Support to listen for widget rearrangement and get the re-arranged widget definitions array
* Improvements to maximize feature on widgets, Widgets can now maximize to full screen
* Source code for the library reduce by 15% in compared to previous code ( I know this is a show off :D)
* Re- architectured the way we render charts to support more type of charts instead of sticking to bar, pie and line.
* Added example to render an already existing dom element as a dashboard widget (see the twitter widget on the demo page)

Previous version : V1.0

* Drag and rearrange widgets
* Maximizing & Minimizing a widget
* Close Widgets
* Rendering data table with in widget
* Rendering Bar/Pie/Donut/Line charts (deprecated)
* Ability to click through table rows
* Ability to click on chart data
* Ability to select chart data
* Adding a  widget dynamically
* Removing a widget dynamically
* Jquery UI  themeroller support



##Dependencies

sDashboard depends on the following libraries

* Jquery 
* Jquery UI
* Datatables (required for table widgets)
* Flotr2 charts (required for charting widgets)


## How to set up

To set up a basic dashboard :

* include the dependent libraries and css files. 

```html
	<!-- load jquery ui css theme -->
	<link type="text/css" href="css/jquery-ui.css" rel="stylesheet" />
	
	<!-- load the sDashboard css -->
	<link href="../sDashboard.css" rel="stylesheet">

	<!-- load jquery library -->
	<script src="libs/jquery/jquery-1.8.2.js" type="text/javascript"></script>
	
	<!-- load jquery ui library -->
	<script src="libs/jquery/jquery-ui.js" type="text/javascript"></script>

	<!-- load datatables library -->
	<script src="libs/datatables/jquery.dataTables.js"></script>

	<!-- load flot charting library -->
	<script src="libs/float/jquery.flotr2.min.js" type="text/javascript"></script>

	<!-- load sDashboard library -->
	<script src="../jquery-sDashboard.js" type="text/javascript"></script>

```

* Create a ul dom element to render the dashboard

```html
<ul id="myDashboard"></ul>
```

* Define a Array of widget definitions

```javascript
var widgetDefinitions =[
	{ 
		widgetTitle : "Widget 1" //Title of the widget
		widgetId: "Widget1" //unique id for the widget
		widgetContent: "Some Random Content" //content for the widget
	},
	{
		widgetTitle : "Widget 1" //Title of the widget
		widgetId: "Widget1" //unique id for the widget
		widgetContent: "Some Random Content" //content for the widget
	}
]
```

* call the sDashboard plugin on the ul  and pass in the widgetDefinitions by setting the dashboardData options

```javascript
$("#myDashboard").sDashboard({
	dashboardData : widgetDefinitions		
});
```

##Options

Currently while defining the  widget definitions you can use the following options

###  widgetTitle  

Title of the dashboard widget

###  widgetId  

A unique id for the dashboard widget
###widgetType 

Type of widget, possible values are : `table` , `chart` . When set to table, the widget renders as a data table with default row click event built-in. If its a chart, the widget gets rendered as a flotr2 chart. The chart type depends on the options you pass to the widgetContent.

###getDataBySelection 

Default value is false, when set to true, registers a chart selection event instead of chart click on the flotr2 charts. Generally turn on this setting, if you are using a line chart, for ease of selecting chart data.

###widgetContent 

* When using a basic widget, it can represent an string or any html dom element. For example, if a dom element already exists on the page, and you want to render it as a dashboard widget, simply get a hook to the dom element using $("#id") (or any jQuery selector) and pass it to the widgetDefinition by setting it on the widgetContent.

* if widgetType is set to `chart`, the `widgetContent` is set as an object with two keys, `data` and `options`, a sample setup looks like

```javascript
var chartData; //flort2 data
var charOptions; //flotr2 options

$("#myDashboard").sDashboard("addWidget",{
     widgetId : "id123",
     widgetTitle: "Widget Title",
     widgetType : "chart",
	//isADonut : True //uncomment if the chart is a donut chart
	widgetContent : {
	data : chartData,
	options : chartOptions	
}
});

```

NOTE: `chartData` and `chartOptions` should be constructed based on flotr2 documentation, please see the flotr2 documentation for more details on settings can be found on flotr2 documentation page. You can also refer to the demo example of sDashboard.

* if widgetType is set to `table` , it expected to set as : 

```javascript
var tableData = {
	"aaData" : [[0,2],[2,4],[4,6],[6,8]],
	"aoColumns" : [{
		"sTitle" : "Col A"
	},{
		"sTitle: : "Col B"
	}
]
};

$("#myDashboard").sDashboard("addWidget",{
     widgetId : "id123",
     widgetTitle: "Widget Title",
     widgetType : "table",
	widgetContent : tableData 
});

```

NOTE: aaData, aoColumns and sTitle are datatables specific keywords, please refer to datatable documentation for more details on this.


##Methods

### Add a Widget

To add a widget simple call the `addWidget` method  and pass in the widget definition that needs to be added.

```javascript

$("#myDashboard").sDashboard("addWidget", {
						widgetTitle : "Widget 7",
						widgetId : "id77",
						widgetContent : "Some Content" 
					});

```

### Delete a Widget

To delete a widget simple call the `removeWidget` method and pass in the widget id that you want to remove from the dashboard

```javascript

$("#myDashboard").sDashboard("removeWidget", "id7");

```

###Get Dashboard Data

To get the array of widget definitions in the current dashboard you can use the `getDashboarData` api 

```javascript

var arr = $("#myDashboard").sDashboard("getDashbaordData");

```

Alternatively you can also, use the getter on the  `dashboardData` options

```javascript

var arr = $("#myDashboard").sDashboard("option","dashboardData");

```

## Events

###Table View Row Click

To register for a row click event on a table widget simple set a listener as follows

```javascript

//table row clicked event example

$("#myDashboard").bind("sdashboardrowclicked", function(e, data) {
	alert("table row clicked");
	if (console) {
		console.log("table row clicked, for widget: " + data.selectedWidgetId);
	}
});

```

### Chart Plot Selection

To register for a plot selection event on a chart widget simply set a listener as follows

```javascript

//plot selected event example
$("#myDashboard").bind("sdashboardplotselected", function(e, data) {
	alert("plot selected");
	if (console) {
		console.log("chart range selected, for widget: " + data.selectedWidgetId);
	}
});
```

### Chart Plot Click 

To register for a plot click event on a chart widget simply set a listener as follows

```javascript

//plot click event example
$("#myDashboard").bind("sdashboardplotclicked", function(e, data) {
	alert("plot clicked");
	if (console) {
		console.log("chart clicked, for widget: " + data.selectedWidgetId);
	}
});


```

###Widgets rearranged
When widgets are rearranged by dragging around, the sDashboard dispatches a `sdashboardorderchanged` event. The event carries an array of sortedDefinitions which are stored with a key `sortedDefinitions` 

```javascript
$("#myDashboard").bind("sdashboardorderchanged", function(e, data) {
	console.log(data.sortedDefinitions);
});
```

##What's Next

* I am working on implementing features for refreshing individual widgets data and enabling multiple views within a widget, for ex a widget an display a table, bar and pie chart with in it.
* More documentation and bug fixes :D

##Fun Facts
* As you have notices V2.0 is a named release called Salt&Pepper. Just like salt and pepper add great flavor to the food, this release adds a great flavor and taste to the sDashboard framework :D .In all seriousness, I just felt its easy to remember the version with a name rather than a version number.

##Architectural Changes

One of the major change I've made is to replace slot charts with flotr2 library, I ve been researching many charting libraries and I strongly feel that flotr2 is the best charting library in terms of the features and ease of use it provides. Hence went forward with this library. 

##Credits

Special thanks to the following project which are a great source of inspiration for the sDashboard framework.

###Flex dashboards 

sDashboard is heavily inspired from flex dashboard framework, more details flex dashboard can be found at:  [link](http://www.adobe.com/devnet/flex/samples/dashboard.html)

###Flotr2 Charts

sDashboard uses Flotr2 charts to render charts within widgets, more details about flotr2 charts can be found at [link](http://www.humblesoftware.com/flotr2/)

### Datatables

sDashboard uses datatables library to render table grids, more details about datatables can be found at  [link](http://datatables.net/)

### Jquery  &  JQuery UI

Few portions for sDashboard look and feel have been inspired from the following example on the jQuery UI project pages

* portlets : [link](http://jqueryui.com/sortable/#portlets)
* sortable grid : [link](http://jqueryui.com/sortable/#display-grid)

###Other References  

*  DocumentUp library is used to generate the project page for this library, more detail about document up can be found at: [link](http://documentup.com/)

##Change Log

* Current version V2.0

##Licence

The MIT License (MIT)

Copyright (c) 2012 Nikhilesh Katakam

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.







