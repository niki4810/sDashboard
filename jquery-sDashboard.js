/*
 * jquery sDashboard (1.0)
 * Copyright 2012, Nikhilesh Katakam
 * Distributed under MIT license.
 * https://github.com/niki4810/sDashboard
 */

$.widget("nk.sDashboard", {
	version : "1.0",
	options : {
		dashboardData : []
	},
	_create : function() {
		this.element.addClass("sDashboard");
		this._createView();

	},
	_setOption : function(key, value) {
		this.options[key] = value;
		if (key === "dashboardData") {
			this._createView();
		}
	},

	_createView : function() {
		var _dashboardData = this.options.dashboardData;

		for (var i = 0; i < _dashboardData.length; i++) {
			var widget = this._constructWidget(_dashboardData[i]);
			//append the widget to the dashboard
			this.element.append(widget);
			this._renderChart(_dashboardData[i]);
		}

		//call the jquery ui sortable on the columns
		this.element.sortable({
			handle : ".sDashboardWidgetHeader"
		});
		this.element.disableSelection();

		//bind events for widgets
		this._bindEvents();
	},

	_maximizeCharts : function(widgetContainer) {
		//toggle pie charts
		widgetContainer.find(".sDashboardChart.sDashboardPieChartMinimized").hide();
		widgetContainer.find(".sDashboardChart.sDashboardPieChartMaximized").show();

		//toggle bar charts
		widgetContainer.find(".sDashboardChart.sDashboardBarChartMinimized").hide();
		widgetContainer.find(".sDashboardChart.sDashboardBarChartMaximized").show();

		//toggle line charts
		widgetContainer.find(".sDashboardChart.sDashboardLineChartMinimized").hide();
		widgetContainer.find(".sDashboardChart.sDashboardLineChartMaximized").show();

	},
	_minimizeCharts : function(widgetContainer) {
		//toggle pie charts
		widgetContainer.find(".sDashboardChart.sDashboardPieChartMinimized").show();
		widgetContainer.find(".sDashboardChart.sDashboardPieChartMaximized").hide();
		//toggle bar charts
		widgetContainer.find(".sDashboardChart.sDashboardBarChartMinimized").show();
		widgetContainer.find(".sDashboardChart.sDashboardBarChartMaximized").hide();
		//toggle line charts
		widgetContainer.find(".sDashboardChart.sDashboardLineChartMinimized").show();
		widgetContainer.find(".sDashboardChart.sDashboardLineChartMaximized").hide();
	},
	_bindEvents : function() {
		var self = this;
		//click event for maximize button
		this.element.find(".sDashboardWidgetHeader span.ui-icon.ui-icon-circle-plus").live("click", function(e) {
			var widgetContainer = $(e.currentTarget).parents(".sDashboardWidget:first");
			var widgetContent = widgetContainer.find(".sDashboardWidgetContent");

			if ($(e.currentTarget).attr("title") === "Maximize") {
				self._maximizeCharts(widgetContainer);
				$(e.currentTarget).attr("title", "Minimize");
			} else {
				self._minimizeCharts(widgetContainer);
				$(e.currentTarget).attr("title", "Maximize");
			}
			$(e.currentTarget).toggleClass("ui-icon-circle-minus");

			var docHeight = $(document).height();
			var docWidth = $(document).width();

			widgetContainer.toggleClass("sDashboardWidgetContainerMaximized");
			widgetContent.toggleClass("sDashboardWidgetContentMaximized ");
		});

		//delete widget by clicking the 'x' icon on the widget
		this.element.find(".sDashboardWidgetHeader span.ui-icon.ui-icon-circle-close").live("click", function(e) {
			var widget = $(e.currentTarget).parents("li:first")
			var widgetId = widget.attr("id");
			//show hide effect
			widget.hide("fold", {}, 300);
			widget.remove();
			self._removeWidgetFromWidgetDefinitions(widgetId);
		});

		//table row click
		this.element.find(".sDashboardWidgetContent table.sDashboardTableView tbody tr").live("click", function(e) {
			var selectedRow = $(e.currentTarget);

			if (selectedRow.length > 0) {
				var selectedDataTable = selectedRow.parents('table:first').dataTable();

				var selectedWidget = selectedRow.parents("li:first");
				var selectedRowData = selectedDataTable.fnGetData(selectedRow[0]);
				var selectedWidgetId = selectedWidget.attr("id");
				var evtData = {
					selectedRowData : selectedRowData,
					selectedWidgetId : selectedWidgetId
				}
				//trigger dashboardTableViewRowClick changed event
				self._trigger("rowclicked", null, evtData);
			}
		});

		//chart click
		this.element.find("div.sDashboardChart").live("plotclick", function(event, pos, obj) {
			var widget = $(event.currentTarget).parents("li:first");
			var selectedWidgetId = widget.attr("id");
			var evtObj = {
				selectedWidgetId : selectedWidgetId,
				chartData : obj
			}
			if (obj) {
				self._trigger("plotclicked", null, evtObj);
			}
		});

		//chart selection
		this.element.find("div.sDashboardChart").live("plotselected", function(event, ranges) {
			var widget = $(event.currentTarget).parents("li:first");
			var selectedWidgetId = widget.attr("id");
			var evtObj = {
				selectedWidgetId : selectedWidgetId,
				chartData : ranges
			};
			self._trigger("plotselected", null, evtObj);
		});
	},

	_constructWidget : function(widgetDefinition) {

		//create an outer list item
		var widget = $("<li/>").attr("id", widgetDefinition.widgetId);
		//create a widget container
		var widgetContainer = $("<div/>").addClass("sDashboardWidget ui-widget ui-widget-content ui-helper-clearfix ui-corner-all");

		//create a widget header
		var widgetHeader = $("<div/>").addClass("sDashboardWidgetHeader ui-widget-header ui-corner-all");
		var maximizeButton = $('<span title="Maximize" class="ui-icon ui-icon-circle-plus"></span>');
		var deleteButton = $('<span title="Close" class="ui-icon ui-icon-circle-close"></span>');
		//add Maximizebutton
		widgetHeader.append(maximizeButton);
		//add delete button
		widgetHeader.append(deleteButton);
		//add widget title
		widgetHeader.append(widgetDefinition.widgetTitle);

		//create a widget content
		var widgetContent = $("<div/>").addClass("sDashboardWidgetContent");

		if (widgetDefinition.widgetType === 'table') {
			var tableDef = {
				"bJQueryUI" : true,
				"aaData" : widgetDefinition.widgetContent.aaData,
				"aoColumns" : widgetDefinition.widgetContent.aoColumns
			}
			var dataTable = $('<table cellpadding="0" cellspacing="0" border="0" class="display sDashboardTableView"></table>').dataTable(tableDef);
			widgetContent.append(dataTable);
		} else if (widgetDefinition.widgetType === 'pie') {
			var pieChart = $('<div/>').addClass("sDashboardChart sDashboardPieChartMinimized");
			var pieChartMaximized = $("<div/>").addClass("sDashboardChart sDashboardPieChartMaximized");
			widgetContent.append(pieChart);
			widgetContent.append(pieChartMaximized);
			//$.plot(pieChart, data, options);

		} else if (widgetDefinition.widgetType === 'bar') {
			var barChart = $('<div/>').addClass("sDashboardChart sDashboardBarChartMinimized");
			var barChartMaximized = $("<div/>").addClass("sDashboardChart sDashboardBarChartMaximized");
			widgetContent.append(barChart);
			widgetContent.append(barChartMaximized);
		} else if (widgetDefinition.widgetType === 'line') {
			var lineChart = $('<div/>').addClass("sDashboardChart sDashboardLineChartMinimized");
			var lineChartMaximized = $("<div/>").addClass("sDashboardChart sDashboardLineChartMaximized");
			widgetContent.append(lineChart);
			widgetContent.append(lineChartMaximized);
		} else {
			widgetContent.append(widgetDefinition.widgetContent);
		}

		//add widgetHeader to widgetContainer
		widgetContainer.append(widgetHeader);
		//add widgetContent to widgetContainer
		widgetContainer.append(widgetContent);

		//append the widgetContainer to the widget
		widget.append(widgetContainer);

		//return widget
		return widget;
	},

	_renderChart : function(widgetDefinition) {
		var id = "li#" + widgetDefinition.widgetId;
		var chartArea, chartAreaMaximized, data, options;
		if (widgetDefinition.widgetType === 'pie') {

			chartArea = this.element.find(id + " div.sDashboardChart.sDashboardPieChartMinimized");
			chartAreaMaximized = this.element.find(id + " div.sDashboardChart.sDashboardPieChartMaximized");
			data = widgetDefinition.widgetContent;
			//if its a pie chart
			if (widgetDefinition.isADonut) {
				options = {
					series : {
						pie : {
							show : true,
							innerRadius : 0.5
						}
					},
					grid : {
						hoverable : true,
						clickable : true
					},
					legend : {
						show : false
					}
				}
			} else {
				//if its a donut chart
				options = {
					series : {
						pie : {
							show : true
						}
					},
					grid : {
						hoverable : true,
						clickable : true
					},
					legend : {
						show : false
					}
				};
			}
			$.plot(chartArea, data, options);
			$.plot(chartAreaMaximized, data, options);
			chartAreaMaximized.hide();
		}
		if (widgetDefinition.widgetType === 'bar') {
			chartArea = this.element.find(id + " div.sDashboardChart.sDashboardBarChartMinimized");
			chartAreaMaximized = this.element.find(id + " div.sDashboardChart.sDashboardBarChartMaximized");
			data = widgetDefinition.widgetContent;
			var chartObj = [{
				data : data,
				bars : {
					show : true
				}
			}];
			var options = {
				grid : {
					hoverable : true,
					clickable : true
				},
				legend : {
					show : true
				}
			}
			$.plot(chartArea, chartObj, options);
			$.plot(chartAreaMaximized, chartObj, options);
			chartAreaMaximized.hide();
		}

		if (widgetDefinition.widgetType === 'line') {
			chartArea = this.element.find(id + " div.sDashboardChart.sDashboardLineChartMinimized");
			chartAreaMaximized = this.element.find(id + " div.sDashboardChart.sDashboardLineChartMaximized");
			data = widgetDefinition.widgetContent;
			options = {
				series : {
					lines : {
						show : true
					},
					points : {
						show : true
					}
				},
				legend : {
					noColumns : 2
				},
				xaxis : {
					tickDecimals : 0
				},
				yaxis : {
					min : 0
				},
				selection : {
					mode : "x"
				}
			};
			$.plot(chartArea, data, options);
			$.plot(chartAreaMaximized, data, options);
			chartAreaMaximized.hide();
		}
	},
	_removeWidgetFromWidgetDefinitions : function(widgetId) {
		var widgetDefs = this.options.dashboardData;
		for (var i in widgetDefs) {
			var currentWidgetId = widgetDefs[i].widgetId;
			if (currentWidgetId === widgetId) {
				widgetDefs.splice(i, 1);
				break;
			}
		}
	},

	_ifWidgetAlreadyExists : function(widgetId) {
		if (!widgetId) {
			throw "Expected widgetId to be defined";
			return;
		}
		var idSelector = "#" + widgetId;
		//get the dom element
		var widget = this.element.find("li" + idSelector);
		if (widget.length > 0) {
			return true;
		}
		return false;
	},

	/*public methods*/
	//add a widget to the dashbaord
	addWidget : function(widgetDefinition) {
		if (!widgetDefinition.widgetId) {
			throw "Expected widgetId to be defined";
			return;
		}

		if (this._ifWidgetAlreadyExists(widgetDefinition.widgetId)) {
			this.element.find("li#" + widgetDefinition.widgetId).effect("shake", {
				times : 3
			}, 800);
		} else {
			this.options.dashboardData.push(widgetDefinition);
			var widget = this._constructWidget(widgetDefinition);
			this.element.prepend(widget);
			this._renderChart(widgetDefinition);
		}
	},
	//remove a widget from the dashboard
	removeWidget : function(widgetId) {
		if (!widgetId) {
			throw "Expected widgetId to be defined";
			return;
		}
		var idSelector = "#" + widgetId;
		//get the dom element
		var widget = this.element.find("li" + idSelector);
		if (widget.length > 0) {
			//delete the dom element
			this.element.find("li" + idSelector).remove();
			//remove the dom element from the widgetDefinition
			this._removeWidgetFromWidgetDefinitions(widgetId);
		}
	},

	//get the wigetDefinitions
	getDashboarData : function() {
		return this.options.dashboardData;
	},
	destroy : function() {
		// call the base destroy function
		$.Widget.prototype.destroy.call(this);
	}
});
