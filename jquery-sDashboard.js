/*
 * jquery sDashboard (2.0)
 * Copyright 2012, Nikhilesh Katakam
 * Distributed under MIT license.
 * https://github.com/niki4810/sDashboard
 */

$.widget("nk.sDashboard", {
	version : "2.0",
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
		var i;
		for ( i = 0; i < _dashboardData.length; i++) {
			var widget = this._constructWidget(_dashboardData[i]);
			//append the widget to the dashboard
			this.element.append(widget);
			this._renderChart(_dashboardData[i]);
		}

		var that = this;
		//call the jquery ui sortable on the columns
		this.element.sortable({
			handle : ".sDashboardWidgetHeader",
			update : function(event, ui) {
				var sortOrderArray = $(this).sortable('toArray');
				var sortedDefinitions = [];
				for ( i = 0; i < sortOrderArray.length; i++) {
					var widgetContent = that._getWidgetContentForId(sortOrderArray[i], that);
					sortedDefinitions.push(widgetContent);
				}

				if (sortedDefinitions.length > 0) {
					var evtData = {
						sortedDefinitions : sortedDefinitions
					}
					that._trigger("orderchanged",null,evtData);
				}

			}
		});
		this.element.disableSelection();

		//bind events for widgets
		this._bindEvents();
	},
	_getWidgetContentForId : function(id, context) {
		var widgetData = context.getDashboarData();
		for (var i = 0; i < widgetData.length; i++) {
			var widgetObject = widgetData[i];
			if (widgetObject.widgetId === id) {
				return widgetObject;
			}
		}
		return [];
	},
	_bindEvents : function() {
		var self = this;
		//click event for maximize button
		this.element.find(".sDashboardWidgetHeader span.ui-icon.ui-icon-circle-plus").live("click", function(e) {

			//toggle the maximize icon into minimize icon
			$(e.currentTarget).toggleClass("ui-icon-circle-minus");
			//change the tooltip on the maximize/minimize icon buttons
			if ($(e.currentTarget).attr("title") === "Maximize") {
				$(e.currentTarget).attr("title", "Minimize");
			} else {
				$(e.currentTarget).attr("title", "Maximize");
			}
			//get the widget List Item Dom
			var widgetListItem = $(e.currentTarget).parents("li:first");
			//get the widget Container
			var widget = $(e.currentTarget).parents(".sDashboardWidget:first");
			//get the widget Content
			var widgetContainer = widget.find(".sDashboardWidgetContent");

			//toggle the class for widget and inner container
			widget.toggleClass("sDashboardWidgetContainerMaximized");
			widgetContainer.toggleClass("sDashboardWidgetContentMaximized ");

			var widgetDefinition = self._getWidgetContentForId(widgetListItem.attr("id"), self);
			if (widgetDefinition.widgetType === "chart") {
				var chartArea = widgetContainer.find(" div.sDashboardChart")
				Flotr.draw(chartArea[0], widgetDefinition.widgetContent.data, widgetDefinition.widgetContent.options);
				if (!widgetDefinition.getDataBySelection) {
					//when redrawing the widget, the click event listner is getting destroyed, we need to re-register it here again
					//need to find out if its a bug on flotr2 library.
					self._bindChartEvents(chartArea[0], widgetListItem.attr("id"), widgetDefinition, self);
				}
			}
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
		} else if (widgetDefinition.widgetType === 'chart') {
			var chart = $('<div/>').addClass("sDashboardChart");
			if (widgetDefinition.getDataBySelection) {
				chart.addClass("sDashboardChartSelectable");
			} else {
				chart.addClass("sDashboardChartClickable");
			}
			widgetContent.append(chart);
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
		var chartArea;
		var data
		var options;

		if (widgetDefinition.widgetType === 'chart') {
			chartArea = this.element.find(id + " div.sDashboardChart");
			data = widgetDefinition.widgetContent.data;
			options = widgetDefinition.widgetContent.options;
			Flotr.draw(chartArea[0], data, options);
			if (widgetDefinition.getDataBySelection) {
				this._bindSelectEvent(chartArea[0], widgetDefinition.widgetId, widgetDefinition, this);
			} else {
				this._bindChartEvents(chartArea[0], widgetDefinition.widgetId, widgetDefinition, this);
			}
		}

	},
	_bindSelectEvent : function(chartArea, widgetId, widgetDefinition, context) {
		Flotr.EventAdapter.observe(chartArea, "flotr:select", function(area) {
			var evtObj = {
				selectedWidgetId : widgetId,
				chartData : area
			};
			context._trigger("plotselected", null, evtObj);
		});
	},
	_bindChartEvents : function(chartArea, widgetId, widgetDefinition, context) {

		Flotr.EventAdapter.observe(chartArea, 'flotr:click', function(d) {
			//only if a series is clicked dispatch a click event
			if (d.index != undefined && d.seriesIndex != undefined) {
				var evtObj = {};
				evtObj.selectedWidgetId = widgetId;
				evtObj.flotr2GeneratedData = d;
				var widgetData = widgetDefinition.widgetContent.data;
				var seriesData = widgetData[d.seriesIndex];
				var selectedData;

				if ($.isArray(seriesData)) {
					selectedData = seriesData[d.index];
				} else {
					selectedData = seriesData;
				}

				evtObj.customData = {
					index : d.index,
					selectedIndex : d.seriesIndex,
					seriesData : seriesData,
					selectedData : selectedData
				}
				context._trigger("plotclicked", null, evtObj);
			}
		});

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
