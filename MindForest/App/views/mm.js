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

		//afterBindingRenderedTemplate: afterBindingRenderedTemplate,
		//afterBindingAddedElement: afterBindingAddedElement,
		//beforeBindingRemovedElement: beforeBindingRemovedElement

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

	function activate() {

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

		//container.contentEditable=true;
		//container.onkeypress = function (event) {
		//  if (!event) event = window.event;
		//  var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
		// //-logger.log('mm keypress: key ' + key);
		//  if (key === 37 || key === 38 || key === 39 || key === 40) {
		//    switch (key) {
		//      case 37:
		//        app.selectFirstParent();
		//        break;
		//      case 38:
		//        app.selectPreviousSibling();
		//        break;
		//      case 39:
		//        app.selectFirstChild();
		//        break;
		//      case 40:
		//        app.selectNextSibling();
		//        break;
		//    }
		//    event.preventDefault();
		//    return false;
		//  }
		//  return true;
		//}

		//set zoom
		if (app.settings.mm.zoom() !== 1) {
			setZoom(app.settings.mm.zoom());
		}

		//center map
		//$(window).scrollTo('#mm-container', '50%', 500);

		//create root lines
		//createLines(data.currentTree());
		//container.focus();

		//init zoom-slider
		/*var slider = */
		//$("#mm-zoom-slider").slider({
		//  min: 0.2,
		//  max: 2,
		//  value: app.settings.mm.zoom(),
		//  slide: function (event, ui) {
		//    setZoom(ui.value);
		//  }
		//});
		//$("#mm-zoom-textbox").change(function () {
		//  slider.slider("value", this.selectedIndex + 1);
		//});
		//slider

	}; //attached


	//#region Private Functions

	/////Connects all child-nodes of the given node with a new line
	//function createLines(FromNode) {
	//	jsPlumb.doWhileSuspended(function () {
	//		var from = 'node-' + FromNode.Id();
	//		var container = 'container-c' + FromNode.Id();
	//		//logger.log('mm creating ' + FromNode.ChildConnections().length + ' lines for ' + from);
	//		for (var i = 0; i < FromNode.ChildConnections().length; i++) {
	//			var to = 'node-' + FromNode.ChildConnections()[i].ToId();
	//			//logger.log('mm creating line: ' + from + ' -> ' + to);
	//			FromNode.ChildConnections()[i].line
	//			  = plumb.connect({
	//			  	source: from,
	//			  	target: to,
	//			  	container: container
	//			  });
	//		}
	//	});
	//}

	/////Creates a line for a given connection (connectiong two nodes)
	//function createLine(Connection) {
	//	var fromRoot = Connection.FromNode() === mm.app.mind.currentTree();
	//	var from = fromRoot ? 'node-' + Connection.FromId() : 'node-' + Connection.FromId();
	//	var container = fromRoot ? 'root-container' : 'container-c' + Connection.FromId();
	//	var to = 'node-' + Connection.ToId();
	//	console.log('creating line:  ' + from + ' ---> ' + to + ' | on ' + container);
	//	Connection.line
	//		  = plumb.connect({
	//		  	source: from,
	//		  	target: to,
	//		  	container: container
	//		  });
	//}

	/////Removes all 'child'-lines from a given node
	//function removeLines(FromNode) {
	//	jsPlumb.doWhileSuspended(function () {
	//		var from = '#node-' + FromNode.Id();
	//		//-logger.log('mm removing lines for ' + from);
	//		for (var i = 0; i < FromNode.ChildConnections().length; i++) {
	//			var line = FromNode.ChildConnections()[i].line;
	//			if (line) {
	//				plumb.detach(line);
	//				line = null;
	//			}
	//		}
	//	});
	//}

	/////Removes the line assigned to a single connection
	//function removeLine(Connection) {
	//	//logger.log('removing line ' + Connection.FromId() + ' - ' + Connection.ToId());
	//	if (Connection.line) {
	//		plumb.detach(Connection.line);
	//		Connection.line = null;
	//	}
	//}

	/////Repaints all lines in the diagram
	//function repaintLines(FromId) {
	//	var from = 'node-' + FromId;
	//	//logger.log('mm repainting lines for ' + from);
	//	//plumb.repaint(from);
	//	//-logger.log('mm repainting all lines because of ' + from);
	//	plumb.repaintEverything();
	//}

	//#endregion Private Functions

	//#region Methods

	function nodeClick(con) {
		//if (item.HasChildren()) {
		//logger.log("mm NodeClick before expandNode", item);
		expandNode(con);
		//}
		//else {
		//  //logger.log("mm NodeClick before showDetailsNode", item);
		//  mind.currentConnection(item);
		//  showDetails(item);
		//}
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

				//var defered = Q.defer();
				mind
				  .loadChildren(con.ToNode(), selectChild)
				  .then(function (result) {
				  	//-logger.log('mm expandNode after data.loadChildren', { con: con, selectChild: selectChild });
//				  	repaintLines(result.FromNode.Id());
				  	//createLines(result.FromNode);   //creating the line on afterBindingAddedElement
				  	if (result.selectChild >= 0) {
				  		mind.currentConnection(con.ToNode().ChildConnections()[result.selectChild]);
				  	}
				  })
				;
				//return defered.promise;
			}
			else {
				logger.log('mm expandNode without data.loadChildren', { con: con, selectChild: selectChild });
				//setTimeout(function () {
				//	createLines(con.ToNode());
				//	repaintLines(con.FromId());
				//}, 500);
				//if (selectChild >= 0) {
				//	mind.currentConnection(con.ToNode().ChildConnections()[selectChild]);
				//}
			}
		}
		else { //collapse
			//-logger.log("mm expandNode collapse " + con.isExpanded(), con);
//			removeLines(con.ToNode());
			con.isExpanded(false);
			//setTimeout(function () {
			//	repaintLines(con.FromId());
			//}, 500);
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


	//function afterBindingRenderedTemplate(elements, data) {
	//	logger.log('afterBindingRenderedTemplate | ' + data.ToId(), '', { elements: elements, data: data });
	//		createLine(data);

	//} //afterBindingRenderedTemplate

	//function afterBindingAddedElement(element, index, data) {
	//	logger.log('afterBindingAddedElement | ' + data.ToId(), '', { elements: elements, index: index, data: data });
	//	if ($(element).html()) {
	//		createLine(data);
	//	}
	//} //afterBindingAddedElement

	//function beforeBindingRemovedElement(element, index, data) {
	//	logger.log('beforeBindingRemovedElement | ' + data.ToId(), '', { elements: elements, index: index, data: data });
	//	removeLine(data);
	//} //beforeBindingRemovedElement

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