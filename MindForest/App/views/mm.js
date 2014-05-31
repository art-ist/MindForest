define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {
	"use strict";

	var mm = {

		//Properties
		title: ko.observable(),
		app: app,
		data: mind,

		zoom: app.settings.mm.zoom,

		//Lifecycle Events
		canActivate: canActivate,
		activate: activate,
		attached: attached,

		//Methods
		nodeClick: nodeClick,
		expandNode: expandNode,
		showDetails: showDetails,
		afterNodeMove: afterNodeMove,

		zoomIn: zoomIn,
		zoomOut: zoomOut,
		setZoom: setZoom,

		plumb: null

	};

	//#region Private Fields
	var self = this;

	var pars = $.requestParameters();
	var lang = pars['lang'] ? '&Lang=' + pars['lang'] : '';
	var forest = pars['forest'] ? '&Forest=' + pars['forest'] : '';

	//handle doubleclick
	var clickDelay = 200,
		clickCount = 0,
		clickTimer = null;

	//#endregion Private Fields
	return mm;

	function canActivate(treeName, queryString) {
		return app.canOpenTreeByName(treeName, 'mm');
	} //canActivate

	function activate(treeName, queryString) {
		//initialize plumb
		mm.plumb = jsPlumb.getInstance({
			//Container: 'mm-container',
			Connector: ["Bezier", { curviness: 30, cssClass: 'mm-connector' }],
			Anchors: ["Right", "Left"],
			Endpoint: ["Blank", {}],
			PaintStyle: {
				lineWidth: 2,
				strokeStyle: "#999"
			}
		});

		var rootNode = mind.currentTree();
		mind.loadChildren(rootNode, true);
	} //activate

	function attached() {
		var container = document.getElementById('mm');
		//-logger.log('mm init', container);

		//set zoom
		if (app.settings.mm.zoom() !== 1) {
			setZoom(app.settings.mm.zoom());
		}

	}; //attached

	//#region Methods

	function nodeClick(con) {
		//logger.log("mm NodeClick before expandNode", item);
	    expandNode(con);
	} //nodeClick

	function nodeDblClick(item) {
		showDetails(item);
	} //nodeDblClick

	function expandNode(con, selectChild) {
		if (!(selectChild >= 0)) {
			mind.currentConnection(con);
		}
		if (!con.isExpanded() || selectChild >= 0) { //expand
			//logger.log("mm expandNode expand before: " + con.isExpanded(), con);
			con.isExpanded(true);
			if (con.ToNode().ChildConnections().length === 0) {
				mind
				  .loadChildren(con.ToNode(), selectChild)
				  .then(function (result) {
				  	//-logger.log('mm expandNode after data.loadChildren', { con: con, selectChild: selectChild });
				  	if (result.selectChild >= 0) {
				  		mind.currentConnection(con.ToNode().ChildConnections()[result.selectChild]);
				  	}
				  })
				;
			}
			else {
				logger.log('mm expandNode without data.loadChildren', { con: con, selectChild: selectChild });
			}
		}
		else { //collapse
			//-logger.log("mm expandNode collapse " + con.isExpanded(), con);
			con.isExpanded(false);
		} //if
	} //expandNode

	function showDetails(item) {
		if (item.ToNode() !== mind.currentConnection().ToNode() || !app.detailsVisible) {
			mind.loadChildren(item.ToNode(), true);
			app.toggleDetails('show');
		}
		else {
			app.toggleDetails('hide');
		}
	} //showDetails

	function afterNodeMove(arg) {
		// arg.item ... connection moved
		// arg.sourceParent ... children Collection of source parent
		// arg.targetParent ... children Collection of target parent
		// arg.sourcetIndex ... position in source collection
		// arg.targetIndex ... position in target collection
		app.moveNode(arg.item, arg.targetParent); /*, arg.targetIndex + 1*/
	} //afterNodeMove

	//#endregion Methods


	function zoomIn() {
		//var zoom = app.settings.mm.zoom();
		//logger.log('mm zoom ' + zoom);
		if (app.settings.mm.zoom() < 2) {
			setZoom(Math.round((app.settings.mm.zoom() + 0.2) * 10) / 10);
		}
	} //zoomIn

	function zoomOut() {
		//var zoom = app.settings.mm.zoom();
		if (app.settings.mm.zoom() > 0.2) {
			setZoom(Math.round((app.settings.mm.zoom() - 0.2) * 10) / 10);
		}
	} //zoomOut

	function setZoom(factor) {
		//logger.log('mm setting zoom to ' + factor);
		var prefix = ["-webkit-", "-moz-", "-ms-", "-o-", ""];
		var scale = "scale(" + factor + ")";
		var container = $('#mm-container');
		for (var i = 0; i < prefix.length; i++) {
			container.css(prefix[i] + "transform", scale);
		}
		plumb.setZoom(factor);
		app.settings.mm.zoom(factor);
	} //setZoom

}); //define