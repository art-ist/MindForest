define([
  'require',
  'plugins/router',
  'services/logger',
  'services/auth',
  'services/mind'
], function (require, router, logger, auth, mind) {
	"use strict";

	var app = {
		initialize: initialize,

		//Properties
		mind: mind,

		forest: null,
		lang: ko.observable('%'),
		map: null,

		user: {
			name: ko.observable('Anonymous'),
			//id: new ko.observable('0'),

			roles: ko.observableArray(['Owner']),

			isInRole: function (role) {
				return (app.user.roles().indexOf(role) > -1);
			},

			//Permissions
			mayEdit: ko.computed(function () {
				return (app.user && (app.user.isInRole('Author') || app.user.isInRole('Owner')));
			}, null, { deferEvaluation: true }), //ATTENTION: must deferEvaluation because in the initial run app is not yet defined

			isAuthenticated: ko.computed(function () {
				return (app.user && (app.user.name() !== 'Anonymous'));
			}, null, { deferEvaluation: true }) //ATTENTION: must deferEvaluation because in the initial run app is not yet defined
		}, //user

		state: {
			edit: ko.observable(false)
		},
		detailsVisible: false,

		settings: {
			map: ko.observable('mm'), // outline
			animationDuration: ko.observable(500),
			cycleNavigation: ko.observable(false),
			autoScroll: ko.observable(true),
			detailsStyle: ko.observable('tool-right'), // , lightBox, tool-right
			appBar: ko.observable('hide'),
			mm: {
				zoom: ko.observable(1)//,
				//wrapItems: new ko.observable(false)
			}
		}, //settings

		//Methods
		login: login,
		logout: logout,

		isSelected: isSelected,
		select: select,
		selectNextSibling: selectNextSibling,
		selectPreviousSibling: selectPreviousSibling,
		selectFirstChild: selectFirstChild,
		selectFirstParent: selectFirstParent,

		showForest: showForest,
		hideForest: hideForest,
		openTree: openTree,
		canOpenTreeByName: canOpenTreeByName,

		toggleDetails: toggleDetails,
		showDetails: function () { toggleDetails('show') },
		hideDetails: function () { toggleDetails('hide') },
		showWebPage: showWebPage,
		hideWebPage: hideWebPage,
		toggleEdit: toggleEdit,

		addChild: addChild,
		addSibling: addSibling,
		addText: addText,
		cloneNode: cloneNode,
		moveNode: moveNode,
		addDetail: addDetail,
		deleteNode: deleteNode,
		deleteDetail: deleteDetail,

		undo: undo,
		save: save

	}
	//#region constructor
	//#endregion constructor
	return app;


	//#region Private Functions

	function _getForestFromPath() {
		var forest = null;
		//parse Url and get name of firstlevel directory
		var parts = window.location.href.split('#')[0].split('?')[0].split('/');
		if (parts.length > 3) {
			forest = parts[3];
		}
		return forest;
	}

	function initialize() {
		logger.log('app initializing', 'app - initialize');

		//TODO: get/store settings from localstorage
		app.forest = QueryString.forest || QueryString.Forest || _getForestFromPath();
		app.lang(QueryString.lang || QueryString.Lang || $.defaultLanguage.split('-')[0]); //'%'

		//to prevent circular dependency
		auth.initialize(app);
		mind.initialize(app);

		//hook global up keyboard functions
		document.onkeypress = document_onkeypress;

		//TODO: fix modal dialog keyboard shortcuts
		//hook up modal dialog keyboard shortcuts
		$('#login.modal').keypress(function (event) {
			if (event.which === 13) {
				event.preventDefault(); //prevent default scrolling behaviour
				$(this).children('.btn-primary')[0].onclick;
				return false;
			}
		});

		logger.log('app initialized', 'app - initialize'/*, app*/);
	} //initialize

	function findNodeById(collection, nodeId) {
		if (typeof (collection) === ko.observableArray)
			collection = collection();
		for (var i = 0; i < collection.length; i++) {
			if (collection[i].Id === nodeId)
				return collection[i];
		}
		return null;
	}

	//#endregion Private Functions


	//#region Event Handlers

	function document_onkeypress(event) {
		//see http://javascript.info/tutorial/keyboard-events

		if (event.isDefaultPrevented) {
			return false;
		}

		// get the key event.type must be keypress
		var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
		function getChar(event) {
			if (event.which === null) {
				return String.fromCharCode(event.keyCode); // IE
			}
			else if (event.which !== 0 && event.charCode !== 0) {
				return String.fromCharCode(event.which);   // the rest
			}
			else {
				return null; // special key
			}
		}

		// get app specific values
		var edit = app.state.edit();

		//navigation
		switch (key) {
			case 37: //up
				event.preventDefault(); //prevent default scrolling behaviour
				app.selectFirstParent();
				return false;
			case 38: //left
				event.preventDefault(); //prevent default scrolling behaviour
				app.selectPreviousSibling();
				return false;
			case 39: //right
				event.preventDefault(); //prevent default scrolling behaviour
				app.selectFirstChild();
				return false;
			case 40: //down
				event.preventDefault(); //prevent default scrolling behaviour
				app.selectNextSibling();
				return false;
			case 13: //enter
				event.preventDefault(); //prevent default scrolling behaviour
				app.toggleDetails('show');
				return false;
			case 27: //esc
				//app.hideWebPage();
				event.preventDefault(); //prevent default scrolling behaviour
				app.toggleDetails('hide');
				return false;
		} //switch

		//commands
		var char = getChar(event || window.event);
		if (!char) return;
		char = char.toUpperCase();
		if (event.ctrlKey) {
			if (char === 'E') { // ctrl+E ... toggle edit mode
				event.preventDefault(); //prevent default behaviour
				app.toggleEdit();
				return false;
			}
			if (char === 'D') { // ctrl+D ... toggle view details
				event.preventDefault(); //prevent default behaviour
				app.toggleDetails();
				return false;
			}
			if (char === 'M') { // ctrl+M ... new child
				event.preventDefault(); //prevent default behaviour
				if (edit) app.addChild();
				return false;
			}
			if (char === 'N') { // ctrl+N ... new sibling
				event.preventDefault(); //prevent default behaviour
				if (edit) app.addSibling();
				return false;
			}
			if (event.shiftKey && char === 'C') { // ctrl+shift+C ... clone current node
				event.preventDefault(); //prevent default behaviour
				if (edit) app.cloneNode();
				return false;
			}
			if (char === 'S') { // ctrl+S ... save
				event.preventDefault(); //prevent default behaviour
				if (edit) app.save();
				return false;
			}
			if (char === 'Z') { // ctrl+Z ... undo (unsaved) changes
				event.preventDefault(); //prevent default behaviour
				if (edit) app.undo();
				return false;
			}
			//Test
			if (char === 'T') { // ctrl+Z ... undo (unsaved) changes
				event.preventDefault(); //prevent default behaviour
				alert('Ctrl-T detected')
				return false;
			}
		} //if (event.ctrlKey)

		return true;
	}; //document_onkeypress

	//#endregion Event Handlers


	//#region Methods

	//app.keyset = {
	//  form: function formKeyset(item, event) {
	//    var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
	//   //-console.log('app formKeyset keypress: key ' + key);

	//    //prevent bubble
	//    event.cancelBubble();
	//    return true;
	//  }
	//};

	//#region security

	function login(username, password) {
		auth.login(
		  username,
		  password,
		  function success(claims) {
		  	$.each(claims, function (i, claim) {
		  		switch (claim.Type) {
		  			case "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
		  				app.user.name(claim.Value);
		  				break;
		  			case "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
		  				app.user.roles.push(claim.Value);
		  				break;
		  		}
		  	});
		  	console.log('[app.js - login] success', app.user);
		  },
		  function error(message) {
		  	alert(JSON.stringify(message));
		  }
		);
	} //login

	function logout() {
		auth.logout();
		app.user.name('Anonymous');
		app.user.roles.removeAll();
	} //logout

	//#endregion security

	//#region selecting items

	function isSelected(connectionOrNode) {
		if (connectionOrNode.ToNode) {	//it's a connection
			return (connectionOrNode.Id() === mind.currentConnection().Id());
		}
		else if (connectionOrNode.ConnectionsFrom) { //it's a node
			return (connectionOrNode.Id() === mind.currentNode().Id());
		}
		else {
			return false;
		}
	} //isSelected

	function select(connectionOrNode) {
		if (connectionOrNode.ToNode) {	//it's a connection
			////load children
			//if (!isSelected(connectionOrNode)) { // removed: || !app.detailsVisible 
			//	mind.loadChildren(connectionOrNode.ToNode(), true);
			//}
			//select
			mind.currentConnection(connectionOrNode);
			mind.currentNode(null);
			logger.log('selecting connection ' + connectionOrNode.Id(), 'app - select', connectionOrNode);
		}
		else if (connectionOrNode.ConnectionsFrom) { //it's a node
			////load children
			//if (!isSelected(connectionOrNode)) { // removed: || !app.detailsVisible 
			//	mind.loadChildren(connectionOrNode, true);
			//}
			//select
			mind.currentConnection(null);
			mind.currentNode(connectionOrNode);
			logger.log('selecting node ' + connectionOrNode.Id(), 'app - select', connectionOrNode);
		}
		else {
			mind.currentConnection(null);
			mind.currentNode(null);
			logger.log('!! select called with neither connection nor node', 'app - select', connectionOrNode);
		}

		////TODO: get this work
		//if (app.settings.autoScroll()) {
		//	/*app.map*/ $.scrollTo('node-' + connection.ToNode().Id());
		//}
	} //select

	function selectNextSibling() {
		//if (!app.select) return;
		var currCon = mind.currentConnection();
		var parent = currCon.FromNode();
		var siblings = parent.ChildConnections();

		var pos = $.inArray(currCon, siblings);
		if (pos < siblings.length - 1) {
			app.select(siblings[pos + 1]);
		}
		else if (app.settings.cycleNavigation()) {
			app.select(siblings[0]);
		}
	} //selectNextSibling
	function selectPreviousSibling() {
		//if (!app.select) return;
		var currCon = mind.currentConnection();
		var parent = currCon.FromNode();
		var siblings = parent.ChildConnections();

		var pos = $.inArray(currCon, siblings);
		if (pos > 0) {
			app.select(siblings[pos - 1]);
		}
		else if (app.settings.cycleNavigation()) {
			app.select(siblings[siblings.length - 1]);
		}
	} //selectPreviousSibling
	function selectFirstChild() {
		//if (!app.select) return;
		var currCon = mind.currentConnection();
		var childCons = currCon.ChildConnections();
		if (childCons.length) {
			app.map.expandNode(currCon, 0);
		}

	} //selectFirstChild
	function selectFirstParent() {
		//if (!app.select) return;
		var currCon = mind.currentConnection();
		var parentCons = currCon.ParentConnections();
		if (parentCons.length) {
			app.select(parentCons[0]);
		}
	} //selectFirstParent

	//#endregion selecting items

	function showForest(mode) {
		//if (!mind.trees().length) {
		mind.loadTrees();
		//}
		if (app.detailsVisible === true) {
			$('#detailsPage').hide();
		}
		if (mode === 'start') {
			$("#forestPage").show();
		}
		else {
			$('#forestPage').show('slide', { direction: 'left' }, app.settings.animationDuration()); // 'slide', { direction: 'left' }, app.settings.animationDuration()
		}
	} //showForest
	function hideForest() {
		$('#forestPage')
		  .hide('slide', { direction: 'left' }, app.settings.animationDuration()); //'slide', { direction: 'left' }, app.settings.animationDuration()
	} //hideForest

	function canOpenTreeByName(TreeName, ViewName) {
		try {
			logger.log('Checking if canOpenTreeByName', 'app - canOpenTreeByName', { TreeName: TreeName, ViewName: ViewName, currentTree: mind.currentTree() })
			if (mind.currentTree()) {	//currentTree already selected -> ignore parameter and go
				return true;
			}
			if (!TreeName) {	//no TreeName
				return false;
			}
			return mind
				.loadTrees()
				.then(function () {
					var trees = mind.trees();
					for (var i = 0; i < trees.length; i++) {
						for (var n = 0; n < trees[i].Texts().length; n++) {
							if (trees[i].Texts()[n].Title() === TreeName) {
								mind.currentTree(trees[i]);
								if (ViewName) {
									//Tree loaded, ready to activate view
									return true;
								}
								else {
									//no view provided->redirect to deafult view
									return { redirect: '#/' + TreeName + '/' + app.settings.map() };
								}
							} //if (trees[i].Texts[n].Title === TreeName)
						} //for trees[i].Texts()
					} //for trees
					//TreeName not found
					//return { redirect: '#/' };
					return false;
				});
		} catch (e) {
			logger.error('Could not open ' + TreeName + '/' + ViewName, 'app - canOpenTreeByName', e);
			return false;
		}
	}

	function openTree(item, event) {
		var tree = item.Text().Title();
		mind.currentTree(item);
		router.navigate('#/' + (tree ? tree + '/' : '') + app.settings.map());
	} //openTree

	var detailsLoaded = false;
	function toggleDetails(show) {
		if (show === 'show') app.detailsVisible = false;	//on explicit call to show always assume it's hidden
		if (show === 'hide') app.detailsVisible = true;		//on explicit call to hide always assume it's shown

		var effect = app.settings.detailsStyle() === 'tool-right'
					 ? { effect: 'slide', direction: 'right', duration: app.settings.animationDuration() }
					 : app.settings.detailsStyle() === 'lightBox'
					 ? { effect: 'fade', duration: app.settings.animationDuration() }
					 : null
		;

		if (app.detailsVisible) { //hide
			//console.log("hideDitails");
			$('#detailsPage')
			  .hide(effect) // 'slide', { direction: 'right' }, app.settings.animationDuration()
			  .removeClass(app.settings.detailsStyle());
			app.detailsVisible = false;
		}
		else { //show
			//console.log("show Ditails");

			$('#detailsPage')
			  .addClass(app.settings.detailsStyle())
			  .show(effect); //'slide', { direction: 'right' }, app.settings.animationDuration()

			if (!app.detailsLoaded) {
				var detailsFileName;
				switch (app.settings.detailsStyle()) {
					case 'lightBox':
						detailsFileName = '/App/views/details-slide.html';
						break;
						//case 'tool-right':
					default:
						detailsFileName = '/App/views/details-dock.html';
						break;
				}
				$('#detailsPage').load(detailsFileName, function () {
					//-console.log("details loaded");
					ko.applyBindings(app, document.getElementById("detailsPage"));
					app.detailsLoaded = true;
				});
			}

			app.detailsVisible = true;
		}
	} //toggleDetails

	function showWebPage(data, event) {
		var effect = app.settings.detailsStyle() === 'tool-right'
		  ? { effect: 'slide', direction: 'right', duration: app.settings.animationDuration() }
			 : app.settings.detailsStyle() === 'lightBox'
			 ? { effect: 'fade', duration: app.settings.animationDuration() }
			 : null
		;
		var url = data.Link();
		if (data.MediaType() === 'video/youtube') {
			url = 'http://www.youtube.com/embed/' + data.MediaStreamId() + '?autoplay=0&autohide=1&controls=1';
		}
		$('#webContent').attr('src', url);
		$('#webPage-title').text(data.Text().Title());
		$('#webPage')
		  .addClass(app.settings.detailsStyle())
		  .show(effect);
		return false;
	} //showWebPage
	function hideWebPage(data, event) {
		var effect = app.settings.detailsStyle() === 'tool-right'
			   ? { effect: 'slide', direction: 'right', duration: app.settings.animationDuration() }
			   : app.settings.detailsStyle() === 'lightBox'
			   ? { effect: 'fade', duration: app.settings.animationDuration() }
			   : null
		;

		$('#webPage')
		  .hide(effect);
		$('#webContent')
		  .attr('src', 'about:blank');
		return false;
	} //hideWebPage

	function toggleEdit() {
		if (!app.user.mayEdit()) return;
		if (app.state.edit()) {
			app.state.edit(false);
		}
		else {
			app.state.edit(true);
		}
		//-console.log(app.settings.edit());
	} //toggleEdit

	//#region edit

	function addChild() {

	    console.log("DATA-BIND: app.addChild");

	    if (!mind.currentConnection().entityAspect.entityState === breeze.EntityState.Added) { // Abfrage ob neues element
	        mind.loadChildren(mind.currentConnection().ToNode());
        }
	    //addNode(parentNode, insertAfter, relation)
	    var newConnection = mind.addNode(mind.currentConnection().ToNode(), null, Relation.Child);
	    mind.currentConnection().isExpanded(true);
	    mind.currentConnection(newConnection);
	} //addChild

	function addSibling() {

	    console.log("DATA-BIND: app.addSibling. Und mind.currentConnection().Position() = " + mind.currentConnection().Position());

		//var nodeId = mind.currentConnection().ToNode().Id();
		//var nodeUniqueId = mind.currentConnection().ToNode().UniqueId();
		//var parentCon = mind.getParentConnection(nodeId, nodeUniqueId);
		//var parent = mind.findNodeById(currCon.FromId());
		//var parentCon = mind.getParentConnection(parent.Id(), parent.UniqueId());
	    //var newConnection = mind.addNode(parent, currCon.Position(), "project", null);

		//var currCon = mind.currentConnection();
		//var parent = mind.currentConnection().FromNode();
	    var newConnection = mind.addNode(mind.currentConnection().FromNode(), mind.currentConnection().Position(), Relation.Child);
		mind.currentConnection(newConnection);
	} //addSibling 

	function addText(lang) {
		var currCon = mind.currentConnection();
		mind.addNodeText(currCon, lang);
	}

	function cloneNode() {

		console.log("DATA-BIND: app.cloneNode");

		//// Shallow copy
		//var newObject = jQuery.extend({}, oldObject);
		//// Deep copy
		//var newObject = jQuery.extend(true, {}, oldObject);

		var currentConnection = mind.currentConnection();
		var currentNode = currentConnection.ToNode();
		var parent = mind.findNodeById(currCon.FromId());
		var newConnection = mind.addNode(parent, currCon.Position(), currentNode.class, null);
		var newNode = newConnection.ToNode();

		//node Properties
		newNode.Title(currentNode.Title());
		newNode.Lang(currentNode.Lang());
		newNode.NodeType(currentNode.NodeType());
		newNode.IsTreeRoot(currentNode.IsTreeRoot());
		newNode.RichTitle(currentNode.RichTitle());
		newNode.Content(currentNode.Content());
		newNode.Icon(currentNode.Icon());
		newNode.IconStreamId(currentNode.IconStreamId());
		newNode.Class(currentNode.Class());
		newNode.Style(currentNode.Style());
		newNode.Color(currentNode.Color());
		newNode.BackColor(currentNode.BackColor());
		newNode.CloudColor(currentNode.CloudColor());
		newNode.FontName(currentNode.FontName());
		newNode.FontSize(currentNode.FontSize());
		newNode.FontWeight(currentNode.FontWeight());
		newNode.FontStyle(currentNode.FontStyle());
		newNode.ReminderAt(currentNode.ReminderAt());
		newNode.Progress(currentNode.Progress());
		newNode.Link(currentNode.Link());
		newNode.DocumentStreamId(currentNode.DocumentStreamId());
		newNode.MediaType(currentNode.MediaType());
		newNode.MediaOffest(currentNode.MediaOffest());
		newNode.MediaLength(currentNode.MediaLength());
		newNode.MediaCycle(currentNode.MediaCycle());
		newNode.Hook(currentNode.Hook());

		//attach children
		for (var i = 0; i < currentNode.ChildConnections().length; i++) {
			mind.addConnection( //fromNode, toNode, insertAfter, relation, parentCon
				newNode,
				currentNode.ChildConnections()[i].ToNode(),
				null,
				Relation.Child
			);
			//ToDo: copy connection properties
		}

		//copy details
		for (var j = 0; j < currentNode.Details().length; j++) {
			var detail = currentNode.Details()[j];
			var newConnection = mind.addNode(
			  newNode,
			  null,
			  detail.ToNode().Class(),
			  true
			);
			newConnection.ToNode().Title(detail.ToNode().Title());
			newConnection.ToNode().Link(detail.ToNode().Link());
			//ToDo: copy all properties
		}

	} //cloneNode 

	function moveNode(movingConnection, toParentChildren/*, toPosition*/) {

		console.log("DATA-BIND: app.moveNode");

		movingConnection.FromId(toParentChildren.Id); //change FromId to new Parent

		var childConnections = toParentChildren();
		for (var i = 0; i < childConnections.length; i++) { //iterate Children to set Position to current index in array
			childConnections[i].Position(i);
		}
	} //moveNode

	function addDetail(klasse) {

		console.log("DATA-BIND: app.addDetails");

		var newConnection = mind.addNode(mind.currentConnection().ToNode(), null, klasse, true);
		if (klasse === "details_link") {
			newConnection.ToNode().Title("Link Title");
			newConnection.ToNode().Link("http://");
		}
		else {
			newConnection.ToNode().Title("New Description");
		}
		//mind.loadDetails(mind.currentConnection().ToNode());
	} //addDetail

	function deleteNode() {

		console.log("DATA-BIND: app.deleteNode");

		mind.setDeleted();
		mind.saveChanges();
		//only marked as Deleted not realy deleted in DB (saveChanges required)
		//ToDo: UI Feedback that Node is set Deleted
	} //deleteNode

	function deleteDetail(item) {

		console.log("DATA-BIND: app.deleteDetails");

		var parentCon = mind.getParentConnection(item.Id(), item.UniqueId());
		mind.setDetailDeleted(item, parentCon);
		//Detete Current detail
		mind.saveChanges();
	} //deleteDetail

	function undo() {

		console.log("DATA-BIND: app.undo");

		return mind.undoChanges();
		//todo restore ui (-> moves)
	} //undo

	function save() {

		console.log("DATA-BIND: app.save()");

		return mind.saveChanges();
	} //save

	//app.linkNode = function () {}

	//#endregion edit

	//#endregion Methods

});