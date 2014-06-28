define([
  'require',
  'plugins/router',
  'services/logger',
  'services/auth',
  'services/mind',
  'services/storage'
], function (require, router, logger, auth, mind, storage) {
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
			//email: ko.observable(null),
			access_token: ko.observable(null),
			roles: ko.observableArray([]),

			isAuthenticated: ko.computed(function () {
				return app.user.access_token() ? true : false;
			}, null, { deferEvaluation: true }), //ATTENTION: must deferEvaluation because in the initial run app is not yet defined
			isInRole: function (role) {
				return (app.user.roles().indexOf(role) > -1);
			},
			//Permissions
			mayEdit: ko.computed(function () {
				return (app.user.isInRole('Author')); //TODO: add check if user is the creator of current node
			}, null, { deferEvaluation: true }) //ATTENTION: must deferEvaluation because in the initial run app is not yet defined

		}, //user

		state: {
			edit: ko.observable(false)
		},
		detailsVisible: false,

		settings: {
			map: ko.observable('mm'), // outline
			animationDuration: ko.observable(500),
			//throttleComputed: { throttle: 500 },
			cycleNavigation: ko.observable(false),
			autoScroll: ko.observable(true),
			appBar: ko.observable('hide'),
			mm: {
				zoom: ko.observable(1)//,
				//wrapItems: new ko.observable(false)
			},
			detailViews: [
				{ name: 'Dock Right', view: 'views/details/dock', css: 'dock right' },
				{ name: 'Lightbox', view: 'views/details/lightbox', css: 'lightbox' }
			],
			detailViewIndex: ko.observable(1)
		}, //settings

		//Methods
		login: login,
		logout: logout,

		modal_onkeypress: modal_onkeypress,

		isSelected: isSelected,
		select: select,
		selectNextSibling: selectNextSibling,
		selectPreviousSibling: selectPreviousSibling,
		selectFirstChild: selectFirstChild,
		selectFirstParent: selectFirstParent,

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

		storage.get('user', function (value) {
			if (value) {
				//{ name: user.name, access_token: user.access_token, roles: user.roles } );
				app.user.name(value.name);
				app.user.access_token(value.access_token);
				app.user.roles(value.roles);
			}
		});

		//TODO: get/store settings from localstorage
		app.forest = QueryString.forest || QueryString.Forest || _getForestFromPath();
		app.lang(QueryString.lang || QueryString.Lang || $.defaultLanguage.split('-')[0]); //'%'

		//to prevent circular dependency
		auth.initialize(app);
		mind.initialize(app);

		//hook global up keyboard functions
		document.onkeypress = document_onkeypress;

		logger.log('app initialized', 'app - initialize'/*, app*/);
	} //initialize

	////obsolete
	//function findNodeById(collection, nodeId) {
	//	if (typeof (collection) === ko.observableArray)
	//		collection = collection();
	//	for (var i = 0; i < collection.length; i++) {
	//		if (collection[i].Id === nodeId)
	//			return collection[i];
	//	}
	//	return null;
	//}

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

		//pass on all other keys
		return true;
	}; //document_onkeypress

	function modal_onkeypress(data, event) {
		//see http://javascript.info/tutorial/keyboard-events

		var modalSelector = '#' + event.delegateTarget.getAttribute('id');

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

		//navigation
		switch (key) {
			case 37: //up
				return false;
			case 38: //left
				return false;
			case 39: //right
				return false;
			case 40: //down
				return false;
			case 13: //enter
				var $btns = $(modalSelector + ' .action-ok');
				if ($btns.length > 0) {
					$btns[0].click(); //run (first) default action
				}
				event.preventDefault();
				return false;
			case 27: //esc
				var $btns = $(modalSelector + ' .action-cancel');
				if ($btns.length > 0) {
					$btns[0].click(); //run (first) cancel action (e.g. close dialog)
				}
				event.preventDefault();
				return false;
		} //switch

		//pass on all other keys
		return true;
	} //dialogs_onkeypress

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
		return auth
			.login(username, password)
			.done(function (result, textStatus, jqXHR) {
				var user = auth.app.user;
				user.name(result.userName);
				user.access_token(result.access_token);
				//TODO: get roles
				user.roles(['Author']);

				storage.set('user', { name: user.name(), access_token: user.access_token(), roles: user.roles() } );
		});
	} //login

	function logout() {
		if (app.state.edit()) {
			//TODO: if editing save changes
			app.state.edit(false);
		}
		storage.remove('user');
		return auth.logout();
	} //logout

	//#endregion security

	//#region selecting items

	function isSelected(connectionOrNode) {
		if (connectionOrNode.ToNode) {	//it's a connection
			if (!mind.currentConnection()) return false;
			return (connectionOrNode.Id() === mind.currentConnection().Id());
		}
		else if (connectionOrNode.ConnectionsFrom) { //it's a node
			if (!mind.currentNode()) return false;
			return (connectionOrNode.Id() === mind.currentNode().Id());
		}
		else {
			return false;
		}
	} //isSelected

	function select(connectionOrNode) {
		if (connectionOrNode.ToNode) {	//it's a connection
			logger.log('selecting connection ' + connectionOrNode.Id(), 'app - select'/*, connectionOrNode*/, '#container-c' + connectionOrNode.Id());
			////load children
			//if (!isSelected(connectionOrNode)) { // removed: || !app.detailsVisible 
			//	mind.loadChildren(connectionOrNode.ToNode(), true);
			//}
			//select
			mind.currentConnection(connectionOrNode);
			mind.currentNode(connectionOrNode.ToNode());
			//scroll item into view
			$('#mapPage').scrollTo('#container-c' + connectionOrNode.Id(), { duration: app.settings.animationDuration });
		}
		else if (connectionOrNode.ConnectionsFrom) { //it's a node
			logger.log('selecting node ' + connectionOrNode.Id(), 'app - select'/*, connectionOrNode*/);
			////load children
			//if (!isSelected(connectionOrNode)) { // removed: || !app.detailsVisible 
			//	mind.loadChildren(connectionOrNode, true);
			//}
			//select
			mind.currentConnection(connectionOrNode.ConnectionsFrom()[0] || null);
			mind.currentNode(connectionOrNode);
		}
		else {
			logger.error('Neither connection nor node selected. Try again.', 'app - select', connectionOrNode);
			mind.currentConnection(null);
			mind.currentNode(null);
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

	function canOpenTreeByName(TreeName, ViewName) {
		try {
			//logger.log('Checking if canOpenTreeByName', 'app - canOpenTreeByName', { TreeName: TreeName, ViewName: ViewName, currentTree: mind.currentTree() })
			if (mind.currentTree()) {	//currentTree already selected -> ignore parameter and go
				return true;
			}
			if (!TreeName) {	//no TreeName
				return false;
			}
			//if no view provided->redirect to deafult view
			ViewName = ViewName || app.settings.map();
			//search for tree
			return mind
				.loadTrees()
				.then(function () {
					var trees = mind.trees();
					var lang = null;
					for (var i = 0; i < trees.length; i++) {
						for (var n = 0; n < trees[i].Texts().length; n++) {
							if (trees[i].Texts()[n].Title() === TreeName) {
								lang = trees[i].Texts()[n].Lang() || trees[i].Lang()
								mind.currentTree(trees[i]);
								return { redirect: '#/' + TreeName + '/' + ViewName };
							} //if Title === TreeName)
						} //for trees[i].Texts()
					} //for trees
					//TreeName not found
					return false;
				});
		} catch (e) {
			logger.error('Could not open ' + TreeName + '/' + ViewName, 'app - canOpenTreeByName', e);
			return false;
		}
	}

	function openTree(item, event) {
		var tree = item.Local().Title();
		mind.currentTree(item);
		router.navigate('#/' + (tree ? tree + '/' : '') + app.settings.map());
	} //openTree

	var detailsLoaded = false;
	function toggleDetails(show) {
		if (show === 'show') app.detailsVisible = false;	//on explicit call to show always assume it's hidden
		if (show === 'hide') app.detailsVisible = true;		//on explicit call to hide always assume it's shown

		var view = app.settings.detailViews[app.settings.detailViewIndex()];
		var detailsSelector = '#detailsPage.' + view.css.replace(' ', '.');
		//var effect = view.effect;
		//effect.duration = app.settings.animationDuration();
		logger.log(app.detailsVisible ? 'hiding' : 'showing' + ' details', 'app - toggleDetails', detailsSelector);

		if (app.detailsVisible) { //hide
			$('#detailsPage').removeClass('show');
			$('#mapPage').removeClass(view.css);
			app.detailsVisible = false;
		}
		else { //show
			$('#detailsPage').addClass('show');
			$(detailsSelector).addClass('show');
			$('#mapPage').addClass(view.css);
			if (mind.currentConnection()) {
				$('#mapPage').scrollTo('#container-c' + mind.currentConnection().Id(), { duration: app.settings.animationDuration });
			}
			app.detailsVisible = true;
		}
	} //toggleDetails

	function showWebPage(data, event) {
		var url = data.Link();
		//#region exceptions
		//open facebook in new window
		if (url.indexOf("facebook.com") > -1) {
			window.open(url);
			return;
		}
		//load youtube using embedded player
		if (data.MediaType() === 'video/youtube') {
			url = 'http://www.youtube.com/embed/' + data.MediaStreamId() + '?autoplay=0&autohide=1&controls=1';
		}
		//#endregion exceptions
		$('#webContent').attr('src', url);
		$('#webPage-title').text(data.Local().Title());
		$('#webPage').addClass('show');
		return false;
	} //showWebPage
	function hideWebPage(data, event) {
		$('#webPage').removeClass('show');
		$('#webContent').attr('src', 'about:blank');
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
		logger.log("addChild", 'app - addChild');
		if (!mind.currentConnection().entityAspect.entityState === breeze.EntityState.Added) { // Abfrage ob neues element
			mind.loadChildren(mind.currentConnection().ToNode());
		}
		//addNode(parentNode, insertAfter, relation)
		var newConnection = mind.addNode(mind.currentNode(), null, Relation.Child);
		mind.currentConnection().isExpanded(true);
		app.select(newConnection);  //mind.currentConnection(newConnection);
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
		app.select(newConnection);  //mind.currentConnection(newConnection);
	} //addSibling 

	function addText(lang) {
		logger.log("addText", 'app - addText', lang);
		var node = mind.currentNode();
		mind.addNodeText(node, lang);
	}

	function cloneNode() {

		console.log("DATA-BIND: app.cloneNode");

		//// Shallow copy
		//var newObject = jQuery.extend({}, oldObject);
		//// Deep copy
		//var newObject = jQuery.extend(true, {}, oldObject);

		var currentConnection = mind.currentConnection();
		var currentNode = currentConnection.ToNode();
		var parent = currentConnection.FromNode(); 
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
		newNode.CssClass(currentNode.CssClass());
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
			  detail.ToNode().CssClass(),
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
		var newConnection = mind.addNode(mind.currentConnection().ToNode(), null, Relation.Detail);
		if (klasse === "details_link") {

			console.log("DATA-BIND: app.addDetails - klasse === details_link");
			
			newConnection.ToNode().Local().Title("Link Title");
			newConnection.ToNode().Link("http://");
		}
		else {

			console.log("DATA-BIND: app.addDetails - klasse != details_link")

			newConnection.ToNode().Local().Title("New Description");
		}
		//mind.loadDetails(mind.currentConnection().ToNode());
	} //addDetail

	function deleteNode() {

		console.log("DATA-BIND: app.deleteNode");
		if (mind.currentConnection().isTreeRoot) {
			logger.error("You cant delete the TreeRoot!");
			return null;
		}

		var NodeToDelete = mind.currentConnection();
		app.select(NodeToDelete.FromNode().ConnectionsFrom()[0]);  //mind.currentConnection(NodeToDelete.FromNode().ConnectionsFrom()[0]);
		mind.deleteNodeAndConnection(NodeToDelete);
		//mind.saveChanges();
		//only marked as Deleted not realy deleted in DB (saveChanges required)
		//ToDo: UI Feedback that Node is set Deleted
	} //deleteNode

	function deleteDetail(item) {
		console.log("DATA-BIND: app.deleteDetails");
		mind.deleteNodeAndConnection(item.ConnectionsFrom()[0]);
	} //deleteDetail

	function undo() {

		console.log("DATA-BIND: app.undo");

		return mind.undoChanges();
		//todo restore ui (-> moves)
	} //undo

	function save() {
		logger.log("binding called function", 'app - save');
		return mind.saveChanges();
	} //save

	//app.linkNode = function () {}

	//#endregion edit

	//#endregion Methods

});