define([
  'durandal/system',
  'services/logger'
], function (system, logger) {

  //#region Private Fields

  var app = null;
  var mindServiceUri = config.host + '/api{forest}Mind';
  var mindContext = null;
  var mindMetadata = null;

  //#endregion Private Fields

  var mind = {
    initialize: initialize,

    //Properties
    nodes: ko.observableArray([]),
    connections: ko.observableArray([]),
    trees: ko.observableArray([]),
    //currentNode: ko.observable(),
    currentConnection: ko.observable(true),
    currentTree: ko.observable(),
    mapModel: ko.observable({ /*currentNode*/currentConnection: null }),

    //Methods
    loadTrees: loadTrees,
    loadChildren: loadChildren,
    loadDetails: loadDetails,

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

  function initialize(a) {
    app = a;
    mindServiceUri = mindServiceUri.replace(/{forest}/g, app.forest ? '/' + app.forest + '/' : '/');

    mindContext = new breeze.EntityManager(mindServiceUri);
    mindMetadata = mindContext.metadataStore;//see: http://www.breezejs.com/documentation/naming-convention
    mindContext.fetchMetadata()
       .then(function () {
         logger.log('matadata requested', 'mind');
         _extendEntities(mindContext);
       })
       .fail(function (err) {
         logger.log('matadata could not be requested:' + err.message, 'mind');
       })
  }

  //#region Private Functions

  function _extendEntities() {
    //Extensions for computed Properties (
    // see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
    // and: http://www.breezejs.com/documentation/extending-entities

    //Node
    var Node = function () {
      var eventRate = { rateLimit: 50, method: "notifyWhenChangesStop" }; //rateLimit: notify of changes max every XX ms, delay until no change for XX ms 
      //server extensions
      //this.MaxChildPosition = ko.observable(null);
      //client extensions
      this.Details = ko.observableArray(); this.Details.extend(eventRate);
      this.ChildConnections = ko.observableArray(); this.ChildConnections.extend(eventRate);
      //TODO//this.ChildConnections.Id = nodeEntity.Id(); //add Id of current node to Children Collection (needed for app.moveNode)
      this.isDeleted = ko.observable(false);
    }
    mindMetadata.registerEntityTypeCtor("Node:#MindForest.Models", Node);

    //Connection
    var Connection = function () {
      //server extensions
      //this.ToNode = ko.observable(null);
      //client extensions
      this.Level = ko.observable(null);
      this.HasChildren = ko.observable(false);
      this.cIsExpanded = ko.observable(false);
      this.isCurrent = new ko.computed(function () {
        return this === mind.currentConnection();
      }, this);
    }
    mindMetadata.registerEntityTypeCtor("Connection:#MindForest.Models", Connection);

  } //_extendEntities

  //function _getCachedConnections(fromId, toId) {
  //  var custType = mindContext.metadataStore.getEntityType("Connection");
  //  var connectionEntitys = mindContext.getEntities(custType);
  //  for (var i = 0; i < connectionEntitys.length; i++) {
  //    var item = connectionEntitys[i];
  //    if (item.ToId() === toId && item.FromId() === fromId) {
  //      return item;
  //    }
  //  }
  //  return null;
  //}

  //function _queryParameters() {
  //  var self = this;
  //  var paramArray = [];

  //  self.add = function (name, value) {
  //    paramArray.push({ name: name, value: value });
  //  };

  //  self.addParameter = function (par) {
  //    if (!par) return;
  //    paramArray.push(par);
  //  };

  //  self.toString = function () {
  //    if (paramArray.length === 0) return '';
  //    var result = '?';
  //    for (var i = 0; i < paramArray.length; i++) {
  //      if (result !== '?') {
  //        result += '&';
  //      }
  //      result += paramArray[i].name + '=' + paramArray[i].value;
  //    }
  //    return result;
  //  };
  //}

  function _loadMindResult(result) {
    mind.nodes(result.Nodes);
    mind.connections(result.Connections);
    //var trees = ko.utils.arrayFilter(result.Nodes, function (item) {
    //              return (item.IsTreeRoot && item.IsTreeRoot());              ;
    //            });
    var trees = [];
    for (var i = 0; i < result.Nodes.length; i++) {
      var item = result.Nodes[i];
      if (item.IsTreeRoot && item.IsTreeRoot()) {
        trees.push(item);
      }
    }
    mind.trees(trees);
  }

  //#endregion Private Functions


  //#region Methods

  /// <signature>
  ///   <summary>Load all trees of the selected forest. The forest is taken from the URL parameter 'forest' if none is given the servers default forest will be used.</summary>
  /// </signature>
  function loadTrees() {
    var query = new breeze.EntityQuery()
        .from("GetTrees")
        .withParameters({ Lang: app.lang, Forest: app.forest });

    return mindContext.executeQuery(query)
      .then(function (response) {
        var result = response.results[0];
        //logger.log('Trees fetched', 'mind - loadTrees', result);

        _loadMindResult(result);

        logger.log('Trees loaded', 'mind - loadTrees', { Trees: mind.trees(), Nodes: mind.nodes(), Connectinos: mind.connections() });
      })
      .fail(function (ex) {
        logger.error('Could not load trees. ' + ex, 'mind - loadTrees');
      })
    ; //mindContext.executeQuery(query)

  } //loadTrees

  function loadChildren(FromNode, selectChild) {

    var query = new breeze.EntityQuery()
        .from("GetChildren")
        .withParameters({
          Lang: app.lang,
          Forest: app.forest,
          NodeId: FromNode.Id(),
          Levels: "1"
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
      .then(function (result) {

        _loadMindResult(result);

        logger.log('children of ' + FromNode.Id() + ' loaded', 'mind - loadChildren', { FromNode: FromNode, result: result, });
      }) //then
      .fail(function (ex) {
        logger.error(ex, 'mind - loadChildren');
      })
    ; //mindContext.executeQuery(query)


  } //loadChildren

  function loadDetails(node) {

    var query = new breeze.EntityQuery()
        .from("GetNodeDetails")
        .withParameters({ Lang: app.lang, Forest: app.forest, NodeId: node.Id() });

    mindContext.executeQuery(query)
      .then(function (result) {
        result.results.forEach(function (item) {
          if (mindContext.getEntityByKey("Node", item.UniqueId) === null) {
            node.Details.push(item);
          }
        });
      }).fail(function (e) {
        logger.error(ex, 'mind - loadDetails');
      })
    ;//mindContext.executeQuery(query)

  } //loadDetails

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

    //parentCon.cIsExpanded(false);
    if (typeof parentCon !== 'undefined') {
      parentCon.cIsExpanded(true);
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