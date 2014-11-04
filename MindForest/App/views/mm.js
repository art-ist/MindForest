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
		compositionComplete: compositionComplete,

		//Methods
		//nodeClick: nodeClick,
		//expandNode: expandNode,
		//showDetails: showDetails,
		//afterNodeMove: afterNodeMove,

		zoomIn: zoomIn,
		zoomOut: zoomOut,
		setZoom: setZoom,

		plumb: null

	};

	//#region Private Fields
	var self = this;

	var pars = $.requestParameters();
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
		////initialize plumb
		//mm.plumb = jsPlumb.getInstance({
		//	//Container: 'mm-container',
		//	Connector: ["Bezier", { curviness: 30, cssClass: 'mm-connector' }],
		//	Anchors: ["Right", "Left"],
		//	Endpoint: ["Blank", {}],
		//	PaintStyle: {
		//		lineWidth: 2,
		//		strokeStyle: "#999"
		//	}
		//});

		mm.app.map = mm;
	} //activate

	function attached() {
		document.getElementById('mapPage').onkeypress = app.onkeypress_mapPage;
		//var container = document.getElementById('mm');
		//-logger.log('mm init', container);

		//set zoom
		if (app.settings.mm.zoom() !== 1) {
			setZoom(app.settings.mm.zoom());
		}

	}; //attached

	function compositionComplete() {
		initGraphVisual(app.mind.currentTree(), app.mind.manager);
	}

	//#region Methods

	function nodeClick(connectionOrNode) {
		if (connectionOrNode.ToNode) {
			if (connectionOrNode.ToNode().ChildConnections().length === 0) { //node has no ChildConnections
				showDetails(connectionOrNode);
			}
			else {
				expandNode(connectionOrNode);
			}
		}
		else { //root
			app.select(connectionOrNode);
		}
	} //nodeClick

	function nodeDblClick(con) {
		showDetails(con);
	} //nodeDblClick

	function expandNode(con, selectChild) {
		//logger.log("mm expandNode: " + con.Id(), 'mm - expandNode', { con: con, selectChild: selectChild });
		if (!(selectChild >= 0)) {
			app.select(con);  //mind.currentConnection(con);
		}
		if (!con.isExpanded() || selectChild >= 0) { //expand
			//logger.log("mm expandNode expand before: " + con.isExpanded(), con);
			con.isExpanded(true);
			if (selectChild >= 0) {
				app.select(con.ChildConnections()[selectChild]);  //mind.currentConnection(con.ChildConnections()[selectChild]);
			}
			mind.loadChildren(con.ToNode(), selectChild);
		}
		else { //collapse
			//-logger.log("mm expandNode collapse " + con.isExpanded(), con);
			con.isExpanded(false);
		} //if
	} //expandNode

	function showDetails(con) {
		if (con.ToNode() !== mind.currentConnection().ToNode() || !app.detailsVisible) {
			app.select(con);  //mind.currentConnection(con);
			mind.loadChildren(con.ToNode(), true);
			app.showDetails();
		}
		else {
			app.hideDetails();
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
		//mm.plumb.setZoom(factor);
		app.settings.mm.zoom(factor);
	} //setZoom

	function initGraphVisual(treeRoot, entityManager) {

		// "global" variables
		var manager = entityManager,
			schema = { node: null, connection: null },
			//treeRoot = null,
			selectedNode = null,
			selectedNodeData = null;

		// initialise visualisation
		//(function getTreeRoot() {

		//	treeRoot = manager.getEntityByKey('Node', 1);

		//	console.log('[ mm | getTreeRoot ] treeRoot ', treeRoot);
		//	console.log('[ mm | getTreeRoot ] manager ', manager);

		//	if (!treeRoot.IsTreeRoot()) {
		//		var nodes = manager.getEntities('Node');
		//		for (var i = 0; i < nodes.length; i++) {
		//			if (nodes[i].IsTreeRoot()) {
		//				treeRoot = nodes[i];
		//				break;
		//			}
		//		}
		//	}


		//})();

		(function initTree() {

			var $mm = $('#mm-container'),
				cloudColor = treeRoot.CloudColor() ? treeRoot.CloudColor() : 'none';
			var root = '<div class="mm-item-container">'
					+ '<div class="mm-cloud" style="background-color: ' + cloudColor + ';"></div>'
					+ '<canvas class="mm-item-Canvas" left="0" top="0" right="0" bottom="0" style="position: absolute;"></canvas>'
					+ '<div class="mm-node-container" data-key="' + treeRoot.entityAspect._entityKey._keyInGroup + '" "data-isopen"="false">'
						+ '<div>'
							+ '<div class="item">'
								+ '<span class="item-title">'
									+ treeRoot.LTitle()
								+ '</span>'
							+ '</div>'
						+ '</div>'
					+ '</div>'
					+ '<div class="mm-children-container">'
						+ '<ul class="mm-children-list">'
			;

			var conTo = treeRoot.ChildConnections();

			console.log('[ gv | initTree ] conTo: ', conTo);

			for (var i = 0; i < conTo.length; i++) {
				cloudColor = conTo[i].ToNode().CloudColor() ? conTo[i].ToNode().CloudColor() : 'none';
				root += '<li>'
						+ '<div class="mm-item-container">'
							+ '<div class="mm-cloud" style="background-color: ' + cloudColor + ';"></div>'
							+ '<canvas class="mm-item-Canvas" style="position: absolute;"></canvas>'
							+ '<div class="mm-node-container" data-id="' + conTo[i].ToNode().Id() + '" data-key="' + conTo[i].ToNode().entityAspect._entityKey._keyInGroup + '" "data-isopen"="false">'
								+ '<div class="item">'
									+ '<span class="item-title">'
										+ conTo[i].ToNode().LTitle()
									+ '</span>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
					 + '</li>';
			}

			root += '</ul></div></div>';

			$mm.append(root);

		})();

		drawLines($('#mm-container > .mm-item-container > .mm-node-container'));

		$('.mm-node-container').click(function (event) { nodeClick(event); });

		mm.app.mmAPI = {
			deleteNode: deleteNode,
			addChild: addChild
		};
		// end - initialise visualisation

		// inside functions
		function drawLines(currentTarget, isDiggingUp) {

			//console.log('currentTarget', currentTarget);

			if (currentTarget.attr('class') === 'mm-node-container') {

				//console.log('currentTarget', currentTarget);

				var $item = currentTarget.parent(),
					$node = currentTarget,
					$ul = $item.children('.mm-children-container').children('.mm-children-list'),
					$lis = $ul.children('li'),
					canvas = $item.children('canvas')[0];

				var canvasContext = canvas.getContext("2d");

				canvasContext.clearRect(0, 0, canvas.width, canvas.height);

				$(canvas).attr('height', $item.height());
				$(canvas).attr('width', $item.width());
				canvasContext.lineWidth = 2;
				canvasContext.strokeStyle = "#999";

				var posUl = $ul.position();
				var nodeX = Math.floor($node.position().left + $node.width());
				var nodeY = Math.floor($node.position().top + $node.height() / 2);

				for (var i = 0; i < $lis.length; i++) {

					var schwung = 35;

					var $li = $($lis[i]);
					var pos = $li.position();
					var X = pos.left + posUl.left + 30;
					var Y = pos.top + posUl.top + $li.children('.mm-item-container').height() / 2;

					canvasContext.beginPath();
					canvasContext.moveTo(nodeX + 3, nodeY + 4);

					canvasContext.bezierCurveTo(nodeX + 3 + schwung, nodeY + 4, X - schwung, Y, X, Y);
					canvasContext.stroke();

				}

			}

			if (!isDiggingUp) {

				var nextTargets = currentTarget.parents();

				for (var j = 0; j < nextTargets.length; j++) {

					if ($(nextTargets[j]).attr('class') === 'mm-item-container') {
						drawLines($(nextTargets[j]).children('.mm-node-container'), true);
					}

				}

			}

		}
		function appendDOMChildren(domNode, node) {
			//for templating see:
			// http://stephenwalther.com/archive/2010/11/30/an-introduction-to-jquery-templates
			// http://www.strathweb.com/2012/08/knockout-js-pro-tips-working-with-templates/
			// http://aboutcode.net/2012/11/15/twitter-bootstrap-modals-and-knockoutjs.html

			// create children HTML
			domNode.attr('"data-isopen"', "true");

			var nodeId = domNode.attr('data-key'),
				childrenContainer = '<div class="mm-children-container">'
					+ '<ul class="mm-children-list">';

			var conTo = node.ChildConnections()
				, currentNode = null
				, cloudColor = 'none'
			;

			for (var i = 0; i < conTo.length; i++) {
				currentNode = conTo[i].ToNode();
				cloudColor = currentNode.CloudColor() ? conTo[i].ToNode().CloudColor() : 'none';
				childrenContainer += '<li>'
					+ '<div class="mm-item-container">'
						+ '<div class="mm-cloud" style="background-color: ' + cloudColor + ';"></div>'
						+ '<canvas class="mm-item-Canvas" left="0" top="0" right="0" bottom="0" style="position: absolute;"></canvas>'
						+ '<div class="mm-node-container" data-key="' + currentNode.entityAspect._entityKey._keyInGroup + '" "data-isopen"="false">'
							+ '<div class="item">'
								+ '<span class="item-title">'
									+ currentNode.LTitle()
								+ '</span>'
							+ '</div>'
						+ '</div>'
					+ '</div>'
				 + '</li>';
			}

			childrenContainer += '</ul></div></div>';
			// end - create children HTML

			// append children HTML
			domNode.parent().append(childrenContainer);

			// draw lines to child nodes
			drawLines(domNode);

			// initialise eventhandler at new nodes
			domNode.parent().children('.mm-children-container').find('.mm-node-container').click(function (e) { nodeClick(e); });

			// get grandChildren
			var query = new breeze.EntityQuery()
				.from("GetChildren")
				.withParameters({
					Lang: app.lang,
					Forest: app.forest,
					NodeId: nodeId,
					Levels: "2"
				});

			manager.executeQuery(query)
				.then(function () {
					//console.log('[ mm | click ] executeQuery succeded', { manager: manager });
				})
				.fail(function (e) {
					//console.log('[ mm | click ] executeQuery failed', e);
				});
			// end - get grandChildren

		}
		function deleteDOMChildren(domNode) {

			domNode.attr('"data-isopen"', "false");

			domNode.parent().children('.mm-children-container').remove();

			drawLines(domNode);

		}
		function select($currentTarget, node) {

			$(selectedNode).children('.item').removeClass('current');
			selectedNode = $currentTarget[0];
			$(selectedNode).children('.item').addClass('current');
			selectedNodeData = node;
			app.select(node);

		}

		// UI functions
		function nodeClick(event) {

			var currentTarget = $(event.currentTarget),
				isClosed = currentTarget.attr('"data-isopen"') === "true" ? false : true,
				node = manager.getEntityByKey('Node', currentTarget.attr('data-key'));

			select(currentTarget, node);

			if (isClosed) {
				appendDOMChildren(currentTarget, node);
			} else {
				deleteDOMChildren(currentTarget);
			}

		}
		function deleteNode() {

			if (selectedNode) {
				var nodeToDelete = $(selectedNode).parent().parent();
				var currentTarget = nodeToDelete.parent().parent().parent().children('.mm-node-container');
				nodeToDelete.remove();
				drawLines(currentTarget);
				currentTarget.children('.item').addClass('current');
				selectedNode = currentTarget[0];

				console.log(selectedNode);
			} else {
				console.log('[ gv | deleteNode ] there is no selected Node');
			}

		}
		function addChild(key) {

			//console.log(key);
			if (!key) key = 1;

			if (selectedNode) {

				var $domNode = $(selectedNode);
				if ($domNode.attr('"data-isopen"') === "true") {
					var newChild = '<li>'
									+ '<div class="mm-item-container">'
										+ '<div class="mm-cloud" style="background-color: none;"></div>'
										+ '<canvas class="mm-item-Canvas" left="0" top="0" right="0" bottom="0" style="position: absolute;"></canvas>'
										+ '<div class="mm-node-container" data-key="' + key + '" "data-isopen"="false">'
											+ '<div class="item">'
												+ '<span class="item-title">'
													+ 'new Node'
												+ '</span>'
											+ '</div>'
										+ '</div>'
									+ '</div>'
								 + '</li>';
					var target = $domNode.parent().children('.mm-children-container').children('.mm-children-list');
					target.append(newChild);
					target.children('.mm-node-container').click(function (e) { nodeClick(e); });
				} else {
					$domNode.attr('"data-isopen"', "true");
					var childrenContainer = '<div class="mm-children-container">'
							+ '<ul class="mm-children-list">'
								+ '<li>'
									+ '<div class="mm-item-container">'
										+ '<div class="mm-cloud" style="background-color: none;"></div>'
										+ '<canvas class="mm-item-Canvas" left="0" top="0" right="0" bottom="0" style="position: absolute;"></canvas>'
										+ '<div class="mm-node-container" data-key="' + key + '" "data-isopen"="false">'
											+ '<div class="item">'
												+ '<span class="item-title">'
													+ 'new Node'
												+ '</span>'
											+ '</div>'
										+ '</div>'
									+ '</div>'
								 + '</li>'
							+ '</ul></div>';

					$domNode.parent().append(childrenContainer);

					$domNode.parent().children('.mm-children-container').find('.mm-node-container').click(function (e) { nodeClick(e); });

				}
				// end - create and append children HTML

				// draw lines to child node
				drawLines($domNode);

				// initialise eventhandler at new node
				selectedNode = $domNode
					.parent()
					.children('.mm-children-container')
					.find('[data-key="' + key + '"]')[0];
				$(selectedNode).click(function (e) { nodeClick(e); });

				$domNode.children('.item').removeClass('current');
				$(selectedNode).children('.item').addClass('current');

			} else {
				console.log('there is no selected Node');
			}

		}

	} //initGraphVisual

}); //define