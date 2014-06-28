define([
  'durandal/system',
  'services/logger'
], function (system, logger) {
	"use strict";

	//globally define relation "enum"
	window.Relation = {
		Detail: 0,
		Child: 1,
		Link: 2
	};

	//#region Private Fields

	var app = null;
	var mindServiceUri = config.host + '/api{forest}Mind';
	var mindContext = null;

	//#endregion Private Fields

	var mind = {
		initialize: initialize,

		//Properties
		nodes: [],
		connections: [],

		trees: ko.observableArray([]),
		currentTree: ko.observable(null),		//Node
		currentConnection: ko.observable(null),	//Connection
		currentNode: ko.observable(null),		//Node

		mapModel: ko.observable({ /*currentNode*/currentConnection: null }), //Used?

		//Methods
		loadTrees: loadTrees,
		loadChildren: loadChildren,
		//loadDetails: loadDetails,

		//getParentConnection: getParentConnection,
		//getParentNode: getParentNode,
		//findNodeById: findNodeById,

		addConnection: addConnection,
		addNode: addNode,
		addNodeText: addNodeText,
		deleteNodeAndConnection: deleteNodeAndConnection,
		deleteAllDetails: deleteAllDetails,
		deleteChildNodes: deleteChildNodes,

		undoChanges: undoChanges,
		saveChanges: saveChanges
	};

	//#region Constructor

	////set computed properties that require context 

	//// add basic auth header to breeze calls
	//Connection
	function Connection() {
		//extensions in the constructor will be turned into observables by breeze and on export be serialized as unmapped

		this.isExpanded = false; //simple values (transformed to observables by breeze)

	} //Connection
	var ConnectionInitializer = function (self) {
		//extensions in the post-construction initializer will be NOT made observable by breeze will NOT be exported

		self.isCurrent = ko.computed({
			read: function () {
				return self === mind.currentConnection();
			},
			owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //isCurrent
		self.ChildConnections = ko.computed({
			read: function () {
				var result = [];
				if (!self.ToNode || !self.ToNode()) { return result; }
				var connections = self.ToNode().ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Child) {
						result.push(connections[i]);
					}
				}
				return result;
			},
			owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //.extend({ throttle: 500 }); //ChildConnections
		self.ParentConnections = ko.computed({
			read: function () {
				var result = [];
				if (!self.FromNode || !self.FromNode()) { return result; }
				return self.FromNode().ConnectionsFrom();
			},
			owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //.extend({ throttle: 500 }); //ParentConnections
	}; //ConnectionInitializer

	//Node
	function Node() {
		//extensions in the constructor will be turned into observables by breeze and on export be serialized as unmapped

		this.isDeleted = false;

	} //Node
	var NodeInitializer = function (self) {
		//extensions in the post-construction initializer will be NOT made observable by breeze will NOT be exported

		self.Local = ko.computed({
			read: function () {
				//return self.Texts()[0];
				//nothing there
				if (!self.Texts) { return null; }
				////single entity
				//if (self.Texts.Title) {
				//	return self.Text;
				//}
				//empty array 
				if (!self.Texts().length) { return null; }
				//find localized text
				var i = 0;
				for (i = 0; i < self.Texts().length; i++) {
					if (self.Texts()[i].Lang() === app.lang) {
						return self.Texts()[i];
					}
				}
				//return neutral text
				for (i = 0; i < self.Texts().length; i++) {
					if (!self.Texts()[i].Lang || !self.Texts()[i].Lang()) {
						return self.Texts()[i];
					}
				}
				//return whatever you have
				return self.Texts()[0];
			}
			,owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}, self); //Text
		//self.Children = ko.computed({ //"ChildNodes"
		//	read: function () {
		//		var result = [];
		//		var connections = self.ConnectionsTo();
		//		for (var i = 0; i < connections.length; i++) {
		//			if (connections[i].Relation() === Relation.Child) {
		//				result.push(connections[i].ToNode);
		//			}
		//		}
		//		return result;
		//	},
		//	owner: self,
		//	deferEvaluation: true //required because Entity properties are not yet defined
		//}); //.extend({ throttle: 500 }); //Children
		self.Details = ko.computed({
			read: function () {
				var result = [];
				var connections = self.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Detail) {
						result.push(connections[i].ToNode);
					}
				}
				return result;
			}
			,owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //.extend({ throttle: 500 }); //Details
		self.ChildConnections = ko.computed({
			read: function () {
				var result = [];
				if (!self.ConnectionsTo || !self.ConnectionsTo()) { return result; }
				var connections = self.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Child) {
						result.push(connections[i]);
					}
				}
				return result;
			}
			,owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //.extend({ throttle: 500 }); //ChildConnections
		self.ParentConnections = ko.computed({
			read: function () {
				return self.ConnectionsFrom();
				//var result = [];
				//if (!self.ConnectionsTo || !self.ConnectionsTo()) { return result; }
				//var connections = self.ConnectionsTo();
				//for (var i = 0; i < connections.length; i++) {
				//	//whana find the Node if you are on a detail? Why not?
				//	//if (connections[i].Relation() === Relation.Child) {
				//	result.push(connections[i]);
				//	//}
				//}
				//return result;
			}
			,owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //.extend({ throttle: 500 }); //ParentConnections
		self.hasChildren = ko.computed({ //"HasChildNodes"
			read: function () {
				//has at least one non-details-connection
				var connections = self.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Child) {
						return true;
					}
				}
				return false;
			}
			,owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}); //.extend({ throttle: 500 }); //HasChildren

	}; //NodeInitializer


	//#endregion Constructor
	return mind;
	//-----------------------------------------------------------------------------


	function _extendEntities(context) {
		//Extensions for computed Properties (
		// see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
		// and: http://www.breezejs.com/documentation/extending-entities
		var metadata = context.metadataStore;

		metadata.registerEntityTypeCtor("Connection", Connection, ConnectionInitializer); // "Connection:#MindForest.Models"
		metadata.registerEntityTypeCtor("Node", Node, NodeInitializer); // "Node:#MindForest.Models"

	} //_extendEntities

	function initialize(a) {
		app = a;
		mindServiceUri = mindServiceUri.replace(/{forest}/g, app.forest ? '/' + app.forest + '/' : '/');

		//intercept breeze ajax calls
		var ajaxAdapter = breeze.config.getAdapterInstance('ajax');
		ajaxAdapter.requestInterceptor = function (requestInfo) {
			logger.log('issuing ajax call', 'mind - breeze', requestInfo);
		}

		mindContext = new breeze.EntityManager(mindServiceUri);
		//mindMetadata = mindContext.metadataStore;//see: http://www.breezejs.com/documentation/naming-convention
		mindContext
			.fetchMetadata()
			.then(function () {
				logger.log('metadata received', 'mind - initialize'/*, mindContext*/);
				_extendEntities(mindContext);
			})
			.fail(function (err) {
				logger.log('metadata could not be requested:' + err.message, 'mind - initialize', err);
			})
		;
	} //initialize

	//#region Private Functions

	function _loadMindResult(result, reset) {

		if (reset) {
			//reset trees collection
			var trees = [];
			for (var i = 0; i < result.Nodes.length; i++) {
				var item = result.Nodes[i];
				if (item.IsTreeRoot && item.IsTreeRoot()) {
					trees.push(item);
				}
			} //for
			mind.trees(trees);
		}
		for (var n = 0; n < result.Nodes.length; n++) {
			NodeInitializer(result.Nodes[n]);
		}
		for (var c = 0; c < result.Connections.length; c++) {
			ConnectionInitializer(ConnectionInitializer[c]);
		}

	} //_loadMindResult

	//#endregion Private Functions


	//#region Methods

	/// <signature>
	///   <summary>Load all trees of the selected forest. The forest is taken from the URL parameter 'forest' if none is given the servers default forest will be used.</summary>
	/// </signature>
	function loadTrees() {

		//TODO: find out why this couses a delay significantly longer than the request time
		var query = new breeze.EntityQuery()
			.from("GetTrees")
			.withParameters({ Lang: app.lang, Forest: app.forest });

		return mindContext.executeQuery(query)
		  .then(function (response) {
		  	var result = response.results[0];
		  	//logger.log('Trees fetched', 'mind - loadTrees', result);

		  	//load settings
		  	app.settings.forest = result.settings;

		  	_loadMindResult(result.trees, true);

		  	//logger.log('Trees loaded', 'mind - loadTrees', { Trees: mind.trees()/*, Nodes: mind.nodes(), Connectinos: mind.connections()*/ });
		  })
		  .fail(function (ex) {
		  	logger.error('Could not load trees. ' + ex, 'mind - loadTrees');
		  })
		; //mindContext.executeQuery(query)

		//return $.ajax({
		//  type: "GET",
		//  url: mindServiceUri + '/GetTrees',
		//  data: { lang: app.lang },
		//  dataType: "json",
		//  success: function (result) {
		//    logger.log('Trees fetched', 'mind - loadTrees', result);
		//    _loadMindResult(result);
		//    logger.log('Trees loaded', 'mind - loadTrees', { Trees: mind.trees(), Nodes: mind.nodes(), Connectinos: mind.connections() });
		//  }
		//})
		//.fail(function (jqXHR, ex) {
		//  logger.error('Could not load trees. ' + ex, 'mind - loadTrees');
		//});

	} //loadTrees

	function loadChildren(FromNode, selectChild) {
		logger.log('loading children of ' + FromNode.Id(), 'mind - loadChildren'/*, { FromNode: FromNode, selectChild: selectChild, }*/);

		var query = new breeze.EntityQuery()
			.from("GetChildren")
			.withParameters({
				Lang: app.lang,
				Forest: app.forest,
				NodeId: FromNode.Id(),
				Levels: "2"
			});
		query.tag = { FromNode: FromNode, selectChild: selectChild };

		//expecting always one level loaded in advance ( if this is not shure move to executeQuery(query).then )
		if (selectChild && FromNode.Children && FromNode.Children().length > 0) {
			//select first child
			try {
				app.select(FromNode.Children()[0]);  //mind.currentConnection(FromNode.Children()[0]);
			} catch (e) { }
		}

		return mindContext.executeQuery(query)
		  .then(function (response) {
		  	var result = response.results[0];

		  	_loadMindResult(result);

		  	logger.log('children of ' + FromNode.Id() + ' loaded', 'mind - loadChildren'/*, result*/);
		  }) //then
		  .fail(function (ex) {
		  	logger.error(ex, 'mind - loadChildren');
		  })
		; //mindContext.executeQuery(query)

	} //loadChildren

	function addConnection(fromNode, toNode, insertAfter, relation) {

		//get position
		var position = 0, i = 0, indexInsertAfter = -1;
		var siblingCons = fromNode.ConnectionsTo();
		if (insertAfter === null || insertAfter === undefined) { //could be 0
			//find biggest position and add 1
			for (i = 0; i < siblingCons.length; i++) {
				if (siblingCons[i].Position() > position) {
					position = siblingCons[i].Position() + 1;
				}
			}
		} else {
			position = insertAfter + 1;
			//increase Position for all following connections
			for (i = 0; i < siblingCons.length; i++) {
				if (siblingCons[i].Position() === position - 1) {
					indexInsertAfter = i;
				}
				if (siblingCons[i].Position() >= position) {
					siblingCons[i].Position(siblingCons[i].Position() + 1);
				}
			}
		}
		//console.log(fromNode().Id() + "  " + newNodesId + "  " + position);

		//create entity
		var newConnection = mindContext.createEntity('Connection', {
			FromNode: fromNode,
			ToNode: toNode,
			Position: position,
			//RestrictAccess: false,
			Relation: relation,
			CreatedAt: new Date(),
			CreatedBy: app.user.name(),
			ModifiedAt: new Date(),
			ModifiedBy: app.user.name()
		});

		////set initial values
		//newConnection.FromNode(fromNode);
		////newConnection.FromId(1729); // 
		//newConnection.ToNode(toNode);
		////newConnection.ToId(561); //

		logger.log('fromNode.ConnectionsTo().length: ' + fromNode.ConnectionsTo().length, 'mind - addConnection');

		//insert into collections
		if (insertAfter === null || insertAfter === undefined) {
			fromNode.ConnectionsTo.push(newConnection); //TODO: insert to parent at correct position
		}
		else {
			var storItems = fromNode.ConnectionsTo.splice(indexInsertAfter + 1, fromNode.ConnectionsTo().length);
			fromNode.ConnectionsTo.push(newConnection);
			for (var j = 0; j < storItems.length; j++) {
				fromNode.ConnectionsTo.push(storItems[j]);
			}
			//logger.log("fromNode.ConnectionsTo.splice(indexInsertAfter,0,newConnection)", 'mind - addConnection');
		}
		toNode.ConnectionsFrom.push(newConnection); //insert to child

		//TODO: move to app.js where needed
		////get parent connection and expand
		//if (!parentCon && fromNode.ParentConnections()) {
		//	parentCon = fromNode.ParentConnections()[0]; //take first
		//}
		//if (parentCon !== undefined) {
		//	parentCon.isExpanded(true);
		//}

		logger.log('fromNode.ConnectionsTo().length (after push): ' + fromNode.ConnectionsTo().length, 'mind - addConnection'); //WARUM??? bist du immer noch so lange wie vorher obwohl du erfolgreich geändert wurdest?????

		return newConnection;
	} //addConnection

	function addNodeText(node, lang) {
		//create entity
		var nodeText = mindContext.createEntity('NodeText', {}, breeze.EntityState.ADDED);
		//initial values
		nodeText.Node(node);
		nodeText.Lang(lang || null);
		//add to Nodes Texts collection
		node.Texts.push(nodeText);
		//return
		return nodeText;
	}

	function addNode(parentNode, insertAfter, relation) {
		var toNode = mindContext.createEntity('Node', {
			CreatedAt: new Date(),
			CreatedBy: app.user.name(),
			ModifiedAt: new Date(),
			ModifiedBy: app.user.name(),
			IsTreeRoot: false
		});

		//add neutral Texts
		addNodeText(toNode, null);

		//create connection to link node to parentNode
		var newConnection = addConnection(parentNode, toNode, insertAfter, relation);

		//return
		return newConnection; //shouldn't this return the node??
	} //addNode

	//set current connection and node deleted and remove from parents 
	function deleteNodeAndConnection(curCon) {
		//var curCon = mind.currentConnection();

		//tell mindContext to delete entity from db on SaveChanges

		if (curCon.ToNode().hasChildren()) {
			//if (confirm('Do you also want to delete all child nodes (recursive)')) {
			//	deletChildNodes(curCon.ToNode().ChildConnections);
			//} else {
			//	// Do nothing!
			//}
			throw "Delete children before deleting this element.";
		}
		var parent = curCon.FromNode();
		var parentCons = curCon.ToNode().ConnectionsFrom(); // ParentConnections
		if (parentCons && parentCons.length > 1) { // ÁBfrage ob es mehrere Eltern gibt
			if (confirm('Do you want to delete this node from all other parents as well')) {
				//delete node and all parent connections
				deleteAllTexts(curCon.ToNode());
				deleteAllDetails(curCon.ToNode());
				curCon.ToNode().entityAspect.setDeleted();
				for (var i = 0; i < parentCons.length; i++) {
					parentCons[i].entityAspect.setDeleted();
					parentCons[i].FromNode().ConnectionsTo.remove(parentCons[i]);
				}
			} else {
				//delete current connection only
				curCon.entityAspect.setDeleted();
				parent.ConnectionsTo().remove(curCon);
			}
		}
		else { //only one parent connection -> delete node
			deleteAllTexts(curCon.ToNode());
			deleteAllDetails(curCon.ToNode());
			curCon.ToNode().entityAspect.setDeleted();
			curCon.entityAspect.setDeleted();
			parent.ConnectionsTo.remove(curCon);
		}
		parent.ConnectionsTo.valueHasMutated();
		//parent.ChildConnections.valueHasMutated(); //tell ko that computed has changed
	} //deleteNodeAndConnection

	function deleteConnection(curCon) {
		var node = curCon.ToNode();
		var parent = curCon.FromNode();

		//delete current connection only
		curCon.entityAspect.setDeleted();
		node.ConnectionsFrom.remove(curCon);
		parent.ConnectionsTo.remove(curCon);

		node.ParentConnections.valueHasMutated();
		parent.ChildConnections.valueHasMutated(); //tell ko that computed has changed
	} //deleteConnection

	function deleteAllDetails(node) {
		var cons = node.ConnectionsTo();
		for (var i = 0; i < cons.length; i++) {
			if (cons[i].Relation() === Relation.Detail) {
				cons[i].ToNode().entityAspect.setDeleted();
				cons[i].entityAspect.setDeleted();
				//elements are not removed from collection because this function is called only to delete parent node where the whole collection is deleted
			}
		}
		//Detail.isDeleted(true);
		//-console.log("Entyty state after Deleting: " + Detail.entityAspect.entityState + "   " + Connection.entityAspect.entityState);
	} //deleteAllDetails

	function deleteAllTexts(node) {
		var texts = node.Texts();
		for (var i = 0; i < texts.length; i++) {
			texts[i].entityAspect.setDeleted();
			//elements are not removed from collection because this function is called only to delete parent node where the whole collection is deleted
		}
	} //deleteAllTexts


	//recursiveley remove 
	function deleteChildNodes(childNodes) {
		for (var i = 0; i < childNodes().length; i++) {
			childNodes()[i].entityAspect.setDeleted();
			childNodes()[i].ToNode().entityAspect.setDeleted();
			//childNodes()[i].ToNode().isDeleted(true);
			if (childNodes()[i].HasChildren()) {
				deleteChildNodes(childNodes()[i].ToNode().ChildConnections);
			}
			childNodes.remove(childNodes()[i]);
		}
	} //deletChildNodes

	function saveChanges() {
		//-find problem in changes
		//logger.log("saving changes: mindContext", 'mind - saveChanges', mindContext);
		var changes = mindContext.getChanges(); // we'll stash just the changes
		logger.log("saving changes: changes", 'mind - saveChanges', changes);
		var changesExport = mindContext.exportEntities(changes);
		logger.log("saving changes: exported", 'mind - saveChanges', changesExport);
		//-find problem in changes
		mindContext.saveChanges()
			.then(function (saveResult) {
				//var savedEntities = saveResult.entities;
				//var keyMappings = saveResult.keyMappings;
				logger.success("Saved successfully", 'mind - saveChanges');
			})
			.fail(function (e) {
				try {
					var message = 'Save FAILED: ';
					e.entitiesWithErrors.forEach(function (item) {
						var errors = item.entityAspect.getValidationErrors();
						errors.forEach(function (error) {
							message += '\n ' + error.mindContext + ' - ' + error.propertyName + ': ' + error.errorMessage;
						});
					});
					logger.error("Saving failed! " + message, 'mind - saveChanges', e);
				} catch (ex) {
					logger.error("Saving failed! " + e, 'mind - saveChanges', e);
				}
			});
	} //saveChanges

	function undoChanges() {
		mindContext.rejectChanges();
	} //undoChanges


	////obsolete
	//function findNodeById(id) {
	//	var custType = mindContext.metadataStore.getEntityType("Node");
	//	var nodeEntitys = mindContext.getEntities(custType);
	//	for (var i = 0; i < nodeEntitys.length; i++) {
	//		var item = nodeEntitys[i];
	//		if (item.Id() === id) {
	//			if (id === mind.currentTree().Id()) {
	//				return mind.currentTree();
	//			} else {
	//				return item;
	//			}
	//		}
	//	}
	//	return null;
	//} //findNodeById

	//#endregion Methods

});