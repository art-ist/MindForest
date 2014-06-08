define([
  'durandal/system',
  'services/logger'
], function (system, logger) {
	"use strict";

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

		mapModel: ko.observable({ /*currentNode*/currentConnection: null }),

		//Methods
		loadTrees: loadTrees,
		loadChildren: loadChildren,
		//loadDetails: loadDetails,

		getParentConnection: getParentConnection,
		getParentNode: getParentNode,
		findNodeById: findNodeById,

		addConnection: addConnection,
		addNode: addNode,
		setDeleted: setDeleted,
		setDetailDeleted: setDetailDeleted,
		deletChildNodes: deletChildNodes,

		undoChanges: undoChanges,
		saveChanges: saveChanges
	};

	//#region Constructor

	////set computed properties that require context 

	//// add basic auth header to breeze calls

	//#endregion Constructor
	return mind;


	//#region Models

	//Connection
	function Connection() {

		//simple values (transformed to observables by breeze)
		this.isExpanded = false;
		//computed
		this.isCurrent = ko.computed({
			read: function () {
				return this === mind.currentConnection();
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //isCurrent
		this.ChildConnections = ko.computed({
			read: function () {
				var result = [];
				if (!this.ToNode || !this.ToNode()) { return result; }
				var connections = this.ToNode().ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Child) {
						result.push(connections[i]);
					}
				}
				return result;
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //ChildConnections
		this.ParentConnections = ko.computed({
			read: function () {
				var result = [];
				if (!this.FromNode || !this.FromNode()) { return result; }
				var connections = this.FromNode().ConnectionsFrom();
				for (var i = 0; i < connections.length; i++) {
					//whana find the Node if you are on a detail? Why not?
					//if (connections[i].Relation() === Relation.Child) {
						result.push(connections[i]);
					//}
				}
				return result;
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //ParentConnections

	} //Connection

	//Node
	function Node() {
		//var eventRate = { rateLimit: 50, method: "notifyWhenChangesStop" }; //rateLimit: notify of changes max every XX ms, delay until no change for XX ms 
		//var notifyAlways = { notify: 'always' };

		//simple values (transformed to observables by breeze)
		this.isDeleted = false;
		//computed
		this.Text = ko.computed({
			read: function () {
				return this.Texts()[0];
				////nothing there
				//if (!this.Texts) { return null; } 
				////single entity
				//if (this.Texts.Title) {
				//	return this.Text;
				//}
				////empty array 
				//if (!this.Texts().length) { return null; }
				////find localized text
				//for (var i = 0; i < this.Texts().length; i++) {
				//	if (this.Texts()[i].Lang() == app.lang) {
				//		return this.Texts()[i];
				//	}
				//}
				////return neutral text
				//for (var i = 0; i < this.Texts().length; i++) {
				//	if (!this.Texts()[i].Lang()) {
				//		return this.Texts()[i];
				//	}
				//}
				////return whatever you have
				//return this.Texts()[0];
			},
			//owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}, this); //Text
		//this.Children = ko.computed({ //"ChildNodes"
		//	read: function () {
		//		var result = [];
		//		var connections = this.ConnectionsTo();
		//		for (var i = 0; i < connections.length; i++) {
		//			if (connections[i].Relation() === Relation.Child) {
		//				result.push(connections[i].ToNode);
		//			}
		//		}
		//		return result;
		//	},
		//	owner: this,
		//	deferEvaluation: true //required because Entity properties are not yet defined
		//}); //Children
		this.Details = ko.computed({
			read: function () {
				var result = [];
				var connections = this.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Detail) {
						result.push(connections[i].ToNode);
					}
				}
				return result;
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //Details
		this.ChildConnections = ko.computed({
			read: function () {
				var result = [];
				if (!this.ConnectionsTo || !this.ConnectionsTo()) { return result; }
				var connections = this.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Child) {
						result.push(connections[i]);
					}
				}
				return result;
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //ChildConnections
		this.ParentConnections = ko.computed({
			read: function () {
				var result = [];
				if (!this.ConnectionsTo || !this.ConnectionsTo()) { return result; }
				var connections = this.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					//whana find the Node if you are on a detail? Why not?
					//if (connections[i].Relation() === Relation.Child) {
					result.push(connections[i]);
					//}
				}
				return result;
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //ParentConnections
		this.hasChildren = ko.computed({ //"HasChildNodes"
			read: function () {
				//has at least one non-details-connection
				var connections = this.ConnectionsTo();
				for (var i = 0; i < connections.length; i++) {
					if (connections[i].Relation() === Relation.Child) {
						return true;
					}
				}
				return false;
			},
			owner: this,
			deferEvaluation: true //required because Entity properties are not yet defined
		}); //HasChildren

	} //Node

	//#endregion Models


	function _extendEntities(context) {
		//Extensions for computed Properties (
		// see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
		// and: http://www.breezejs.com/documentation/extending-entities
		var metadata = context.metadataStore;

		metadata.registerEntityTypeCtor("Node", Node); // "Node:#MindForest.Models"
		metadata.registerEntityTypeCtor("Connection", Connection); // "Connection:#MindForest.Models"

	} //_extendEntities

	function initialize(a) {
		app = a;
		mindServiceUri = mindServiceUri.replace(/{forest}/g, app.forest ? '/' + app.forest + '/' : '/');

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
			var trees = [];
			for (var i = 0; i < result.Nodes.length; i++) {
				var item = result.Nodes[i];
				if (item.IsTreeRoot && item.IsTreeRoot()) {
					trees.push(item);
				}
			} //for
			mind.trees(trees);
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
		logger.log('loading children of ' + FromNode.Id(), 'mind - loadChildren', { FromNode: FromNode, selectChild: selectChild, });

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
				mind.currentConnection(FromNode.Children()[0]);
			} catch (e) { }
		}

		return mindContext.executeQuery(query)
		  .then(function (response) {
			var result = response.results[0];

			_loadMindResult(result);

			logger.log('children of ' + FromNode.Id() + ' loaded', 'mind - loadChildren', result);
		  }) //then
		  .fail(function (ex) {
			logger.error(ex, 'mind - loadChildren');
		  })
		; //mindContext.executeQuery(query)


	} //loadChildren

	//function loadDetails(node) {

	//	var query = new breeze.EntityQuery()
	//        .from("GetNodeDetails")
	//        .withParameters({ Lang: app.lang, Forest: app.forest, NodeId: node.Id() });

	//	mindContext.executeQuery(query)
	//      .then(function (result) {
	//      	result.results.forEach(function (item) {
	//      		if (mindContext.getEntityByKey("Node", item.UniqueId) === null) {
	//      			node.Details.push(item);
	//      		}
	//      	});
	//      }).fail(function (e) {
	//      	logger.error(ex, 'mind - loadDetails');
	//      })
	//	;//mindContext.executeQuery(query)

	//} //loadDetails

	function addConnection(fromNode, toNode, insertAfter, isDetail, parentCon) {
		if (!parentCon) {
			parentCon = getParentConnection(fromNode.Id(), fromNode.UniqueId());
		}

		var position;
		if (insertAfter === null) {
			position = fromNode.MaxChildPosition() + 1;
		}
		else {
			position = insertAfter + 1;
			//renumber following children
			//renumberConnectionsAt(parentCon.FromId(), position);
		}
		//console.log(fromNode().Id() + "  " + newNodesId + "  " + position);

		var newConnection = mindContext.createEntity('Connection', {
			FromId: fromNode.Id(),
			ToId: newNodesId,
			Position: position,
			UniqueId: guid()
		}, breeze.EntityState.ADDED);
		addExtendedConnectionPoroperties(newConnection, toNode, 1, false, false);

		//initial values
		newConnection.CreatedAt(new Date());
		newConnection.CreatedBy(app.user.name());
		newConnection.ModifiedAt(new Date());
		newConnection.ModifiedBy(app.user.name());
		if (isDetail) {
			newConnection.IsVisible(false);
			fromNode.Details().push(toNode);
			fromNode.Details.valueHasMutated();
		}
		else {
			newConnection.IsVisible(true);
			fromNode.ChildConnections.push(newConnection);
		}

		fromNode.MaxChildPosition(fromNode.MaxChildPosition() + 1);

		//parentCon.isExpanded(false);
		if (typeof parentCon !== 'undefined') {
			parentCon.isExpanded(true);
			parentCon.HasChildren(true);
		}

		return newConnection;
	} //addConnection

	function addNode(parent, insertAfter, Class, isDetail, parentCon) {
		var toNode = mindContext.createEntity('Node', {
			Id: newNodesId,
			UniqueId: guid()
		}, breeze.EntityState.ADDED);
		addExtendedNodePoroperties(toNode, 0);

		//addParameter(toNode, newConnection, 0, 1, false, false)
		//newConnection.ToNode = ko.observable(toNode);

		//initial values
		toNode.Title("New Node");
		toNode.Class(Class);

		toNode.CreatedAt(new Date());
		toNode.CreatedBy(app.user.name());
		toNode.ModifiedAt(new Date());
		toNode.ModifiedBy(app.user.name());
		toNode.IsTreeRoot(false);

		var newConnection = addConnection(parent, insertAfter, isDetail, parentCon);

		//console.log("PositionOrder2: " + log);

		newNodesId--;
		return newConnection;
	} //addNode

	function setDeleted() {
		mind.currentConnection().entityAspect.setDeleted();
		mind.currentConnection().ToNode().entityAspect.setDeleted();
		if (mind.currentConnection().HasChildren()) {
			if (confirm('Do you want to delet also the Child Nodes (Recursive)')) {
				deletChildNodes(mind.currentConnection().ToNode().ChildConnections);
			} else {
				// Do nothing!
			}
		}
		var parent = findNodeById(mind.currentConnection().FromId());
		parent.ChildConnections.remove(mind.currentConnection);
		if (parent.ChildConnections().length === 0) {
			var parentCon = getParentConnection(parent.Id(), parent.UniqueId());
			parentCon.HasChildren(false);
		}
		parent.ChildConnections.valueHasMutated();
	} //setDeleted

	function setDetailDeleted(Detail, Connection) {
		Detail.entityAspect.setDeleted();
		Connection.entityAspect.setDeleted();
		Detail.isDeleted(true);
		//-console.log("Entyty state after Deleting: " + Detail.entityAspect.entityState + "   " + Connection.entityAspect.entityState);
	} //setDetailDeleted

	function saveChanges() {
		mindContext.saveChanges()
		  .then(function (saveResult) {
			var savedEntities = saveResult.entities;
			var keyMappings = saveResult.keyMappings;
			logger.success("Saved", 'SUCCESS|mind - saveChanges')
		  })
		  .fail(function (e) {
			try {
				e.entitiesWithErrors.forEach(function (item) {
					var message = e;
					var errors = item.entityAspect.getValidationErrors();
					errors.forEach(function (error) {
						e += '\n ' + error.mindContext + ' - ' + error.propertyName + ': ' + error.errorMessage;
					});
				});
			} catch (ex) {
				logger.error("Saving failed! " + e, 'mind - saveChanges');
			}
		  });
	} //saveChanges

	function undoChanges() {
		mindContext.rejectChanges();
	} //undoChanges

	function getParentConnection(toId, uniqueId) {
		var possibleConnections = [];
		var k = 0;
		var custType = mindContext.metadataStore.getEntityType("Connection");
		var connectionEntitys = mindContext.getEntities(custType);
		for (var i = 0; i < connectionEntitys.length; i++) {
			var item = connectionEntitys[i];
			if (item.ToId() === toId) {
				possibleConnections[k++] = item;
			}
		}
		if (uniqueId) {
			for (var j = 0; j < possibleConnections.length; j++) {
				var item2 = possibleConnections[j];
				if (item2.ToNode().UniqueId() === uniqueId) {
					return item2;
				}
			}
		}
		else {
			if (possibleConnections.length > 0)
				return possibleConnections[0];
		}

		return null;
	} //getParentConnection

	function getParentNode(toId, uniqueId) {
		var id = getParentConnection(toId, uniqueId).FromId();
		var parentNode = findNodeById(id);
		return parentNode;
	} //getParentNode

	//function renumberConnectionsAt(fromId, position) {
	//  var custType = mindContext.metadataStore.getEntityType("Connection");
	//  var connectionEntitys = mindContext.getEntities(custType);
	//  for (var i = 0; i < connectionEntitys.length; i++) {
	//    var item = connectionEntitys[i];
	//    if (item.FromId() === fromId && item.Position() >= position) {
	//     //-console.log(item.Position());
	//      item.Position(item.Position() + 1);
	//     //-console.log(item.Position());
	//    }
	//  }
	//}

	function findNodeById(id) {
		var custType = mindContext.metadataStore.getEntityType("Node");
		var nodeEntitys = mindContext.getEntities(custType);
		for (var i = 0; i < nodeEntitys.length; i++) {
			var item = nodeEntitys[i];
			if (item.Id() === id) {
				if (id === mind.currentTree().Id()) {
					return mind.currentTree();
				}
				else {
					return item;
				}
			}
		}
		return null;
	} //findNodeById

	function deletChildNodes(childNodes) {
		for (var i = 0; i < childNodes().length; i++) {
			childNodes()[i].entityAspect.setDeleted();
			childNodes()[i].ToNode().entityAspect.setDeleted();
			//childNodes()[i].ToNode().isDeleted(true);
			if (childNodes()[i].HasChildren()) {
				deletChildNodes(childNodes()[i].ToNode().ChildConnections);
			}
			childNodes.remove(childNodes()[i]);
		}
	} //deletChildNodes

	//#endregion Methods

});