define([
  'durandal/system',
  'services/app',
  'services/logger'
], function (system, app, logger) {

  //#region Private Fields

  var mindServiceUri = '/api/Mind';
  var mindContext = new breeze.EntityManager(mindServiceUri);
  //var mindMetadata = new breeze.MetadataStore(); //see: http://www.breezejs.com/documentation/naming-convention
  var mindMetadata = mindContext.metadataStore;
  var mindMetadataFetched = false;

  var newNodesId = -1;

  var pars = $.requestParameters();
  //var forest = pars['forest'] ? {name: 'Forest', value: pars['forest']} : undefined;
  //var lang = { name: 'Lang', value: pars['lang'] ? pars['lang'] : '%' };
  var forest = pars['forest']? pars['forest']: "";
  var lang = pars['lang']? pars['lang']: '%';

  var authentication = {
    scheme: 'Basic',
    token: null,
    setToken: function (uid, pwd) {
      authentication.token = Base64.encode(uid + ":" +pwd);
    }
  };

  //#endregion Private Fields

  var data = {
    initialize: initialize,

    //Properties
    trees: ko.observableArray([]),
    //title: ko.observable(),
    //currentNode: ko.observable(),
    currentConnection: ko.observable(true),
    //connections: ko.observableArray([]),
    currentTree: ko.observable(),
    mapModel: ko.observable({ /*currentNode*/currentConnection: null }),

    //Methods
    login: login,
    logout: logout,

    loadTrees: loadTrees,
    loadNodes: loadNodes,
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

  //// add basic auth header to breeze calls
  //var ajaxAdapter = breeze.config.getAdapterInstance("ajax");
  //ajaxAdapter.defaultSettings = {
  //  beforeSend: function (xhr, settings) {
  //    addAuthorizationToken(xhr, settings);
  //  }
  //};

  //#endregion Constructor
  return data;


  //#region Private Functions

  function initialize() {
    mindContext.fetchMetadata()
      .then(function () {
        logger.log('matadata requested', 'data');
        extendEntities(mindContext);
      })
      .fail(function (err) {
        logger.log('matadata could not be requested:' + err.message, 'data');
      })
  }

  function extendEntities() {
    //Extensions for computed Properties (
    // see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
    // and: http://www.breezejs.com/documentation/extending-entities

    //Node
    var Node = function (mindContext) {
      this.MaxChildPosition = 0;
    }
    mindMetadata.registerEntityTypeCtor("Node:#MindForest.Models", Node);

    //Connection
    var Connection = function () {
      this.Node = null;
    }
    mindMetadata.registerEntityTypeCtor("Connection:#MindForest.Models", Connection);

    } //extendEntities

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  }

  function addExtendedNodePoroperties(nodeEntity, maxChildPosition) {
    nodeEntity.MaxChildPosition = ko.observable(maxChildPosition);
    nodeEntity.Details = ko.observableArray([]);
    nodeEntity.ChildConnections = ko.observableArray([]);
    nodeEntity.ChildConnections.Id = nodeEntity.Id(); //add Id of current node to Children Collection (needed for app.moveNode)
    nodeEntity.isDeleted = ko.observable(false);
    //nodeEntity.isCurrent = new ko.computed(function () {
    //  if (data.currentConnection().ToNode)
    //    return nodeEntity === data.currentConnection().ToNode();
    //  else
    //    return nodeEntity === self.currentTree();
    //}, this);
  } //addExtendedNodePoroperties

  function addExtendedConnectionPoroperties(connectionEntity, nodeEntity, level, hasChildren, isExpanded) {
    connectionEntity.Level = ko.observable(level);
    connectionEntity.HasChildren = ko.observable(hasChildren);
    connectionEntity.ToNode = ko.observable(nodeEntity);
    connectionEntity.cIsExpanded = ko.observable(isExpanded);
    connectionEntity.isCurrent = new ko.computed(function () {
      return connectionEntity === data.currentConnection();
    }, this);
  }

  function getCachedConnections(fromId, toId) {
    var custType = mindContext.metadataStore.getEntityType("Connection");
    var connectionEntitys = mindContext.getEntities(custType);
    for (var i = 0; i < connectionEntitys.length; i++) {
      var item = connectionEntitys[i];
      if (item.ToId() === toId && item.FromId() === fromId) {
        return item;
      }
    }

    return null;
  }

  //function queryParameters() {
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

  function addAuthorizationToken(xhr, settings) {
    if (authentication.token) {
      xhr.setRequestHeader("Authorization", 'Basic ' + authentication.token);
    }
  }

  //#endregion Private Functions


  //#region Methods

  function login(username, password, success, error) {
    //console.log("[data - login] logging in '" + username + "' with password '" + password + "', token: " + Base64.encode(username + ":" + password));
    authentication.setToken(username, password);
    $.ajax({
      type: "GET",
      url: "/api/Identity/Get",
      beforeSend: function (xhr, settings) {
        addAuthorizationToken(xhr, settings);
      },
      success: function (result) {
        console.log('[data.js - login] result', result);
        success(result);
      },
      error: function (err) {
        //-console.log('[data.js - login] error: ' + errMsg.responseText);
        error(err.statusText); //ToDo: display or handdle error
      }
    }); //ajax
  } //login

  function logout() {
    authentication.token = null;
  } //logout

  /// <signature>
  ///   <summary>Load all trees of the selected forest. The forest is taken from the URL parameter 'forest' if none is given the servers default forest will be used.</summary>
  /// </signature>
  function loadTrees() {
    /*
    var queryPars = new queryParameters();
    queryPars.addParameter(lang);
    queryPars.addParameter(forest);
    $.ajax({
      type: "GET",
      url: "/MindForestService.svc/GetTrees" + queryPars.toString(),
      //contentType: "application/json",
      //dataType: "json",
      success: function (result) {
       //-console.log('[data.js - loadTrees] success');

        var data = result.d;
        //trees
        if (data === "") {
          data.trees([]); //ggf. vorhandene Trees löschen
          return;
        }
        data.trees([]);
        for (var i = 0; i < data.length; i++) {
          var toNode = new Node(data[i]);
          data.trees.push(toNode);
         //-console.log('[data.js - loadTrees] adding node: ' + ko.toJSON(toNode));
        }
       //-console.log('[data.js - loadTrees] trees loaded: ' + ko.toJSON(data.trees()));
      },
      error: function (errMsg) {
       //-console.log('[data.js - loadTrees] error: ' + errMsg.responseText);
      
        alert(errMsg.responseText); //ToDo: display or handdle error
      }
    }); //ajax
    */

    //console.log(forest);
    var query = new breeze.EntityQuery()
        .from("Trees")
        .withParameters({ Lang: lang, Forest: forest });

    return mindContext
      .executeQuery(query)
      .then(function (result) {
        logger.log('Trees received', 'data - loadTrees', result);

        //data.trees = result;
        //data.trees([]);
        result.results.forEach(function (item) {
          var a = mindContext.getEntityByKey("Node", item.UniqueId);
          if (typeof a === 'undefined' || a === null) {
            //store and delete extended node data
            var maxChildPosition = item.MaxChildPosition; delete item.MaxChildPosition;

            var nodeEntity = mindContext.createEntity('Node', item, breeze.EntityState.Unchanged);
            addExtendedNodePoroperties(nodeEntity, maxChildPosition);
            data.trees.push(nodeEntity);
          } //if a
        }); //result.results.forEach
        return result;
      })
      .fail(function (e) {
        logger.error('Trees ERROR - ' + e , 'data - loadTrees', e);
        alert("data - loadTrees: " + e); //ToDo: display or handdle error
      });

  } //loadTrees

  function loadNodes(FromNode, selectChild) {
    //-console.log("data loadNodes", FromNode);

    var query = new breeze.EntityQuery()
        .from("GetChildNodes")
        .withParameters({
          Lang: lang,
          Forest: forest,
          NodeId: FromNode.Id(),
          Levels: "1"
        });

    query.tag = { FromNode: FromNode, selectChild: selectChild };

    return mindContext
      .executeQuery(query)
      .then(function (result) {
        //target = result;
        //target([]);
        result.results
          .forEach(function (item) {
            //item.Details = ko.observableArray([]);
            if (getCachedConnections(item.FromId, item.ToId) === null) {

              //store and delete extended connection data
              var level = item.Level; delete item.Level;
              var hasChildren = item.HasChildren; delete item.HasChildren;
              var toNode = item.Node; delete item.Node;
              //store and delete extended node data
              var maxChildPosition = toNode.MaxChildPosition; delete toNode.MaxChildPosition;

              var nodeEntity = mindContext.createEntity('Node', toNode, breeze.EntityState.Unchanged);
              addExtendedNodePoroperties(nodeEntity, maxChildPosition);

              var connectionEntity = mindContext.createEntity('Connection', item, breeze.EntityState.Unchanged);
              addExtendedConnectionPoroperties(connectionEntity, nodeEntity, level, hasChildren, item.IsExpanded);

              if (item.IsVisible) {
                FromNode.ChildConnections.push(connectionEntity);
              }
              else {
                FromNode.Details.push(nodeEntity);
                //console.log("Node: " + FromNode.ChildConnections()[0].ToNode().Title() + ",### currentTree: " + data.currentTree.ChildConnections()[0].ToNode().Title());
              }

            }
            else {
              //-console.log("item alredy attached"); 
            }
          }); //result.results.forEach
        return result.query.tag;
      }) //then
    ;
  } //loadNodes

  function loadDetails(node) {
    //call: loadDetails(data.ToId(), data.ToNode().Details);
    /*
    var queryPars = new queryParameters();
    queryPars.addParameter(forest);
    queryPars.addParameter(lang);
    queryPars.add('NodeId', node.Id());
    $.ajax({
      type: "GET",
      url: "/MindForestService.svc/GetNodeDetails" + queryPars.toString(),
      success: function (result) {
        var data;
        //connections
        data = result.d;
        if (data === "") {
          node.Details([]);
          return;
        }
        node.Details([]);
        for (var i = 0; i < data.length; i++) {
          node.Details.push(data[i]);
        }
      },
      error: function (errMsg) {
        alert(errMsg.responseText);
      }
    }); //ajax
    */

    var query = new breeze.EntityQuery()
        .from("GetNodeDetails")
        .withParameters({ Lang: lang, Forest: forest, NodeId: node.Id() });

    mindContext.executeQuery(query).then(function (result) {

      //node.Details([]);
      result.results.forEach(function (item) {
        //-console.log("Ditails: " + mindContext.getEntityByKey("Node", item.UniqueId));
        if (mindContext.getEntityByKey("Node", item.UniqueId) === null) {
          //store and delete extended node data
          var maxChildPosition = item.MaxChildPosition; delete item.MaxChildPosition;

          var nodeEntity = mindContext.createEntity('Node', item, breeze.EntityState.Unchanged);
          addExtendedNodePoroperties(nodeEntity, maxChildPosition);

          node.Details.push(nodeEntity);
        }
      });
    }).fail(function (e) {
      alert("loadDetails" + e); //ToDo: display or handdle error
    });

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
      fromNode.ChildConnections().push(newConnection);
      fromNode.ChildConnections.valueHasMutated();
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
    data.currentConnection().entityAspect.setDeleted();
    data.currentConnection().ToNode().entityAspect.setDeleted();
    if (data.currentConnection().HasChildren()) {
      if (confirm('Do you want to delet also the Child Nodes (Recursive)')) {
        deletChildNodes(data.currentConnection().ToNode().ChildConnections);
      } else {
        // Do nothing!
      }
    }
    var parent = findNodeById(data.currentConnection().FromId());
    parent.ChildConnections.remove(data.currentConnection);
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
        alert("Save succeeded");
      })
      .fail(function (e) {
        try {
          e.entitiesWithErrors.forEach(function (item) {
            var message = e;
            var errors = item.entityAspect.getValidationErrors();
            errors.forEach(function (error) {
              e += '\n ' + error.mindContext + ' - ' + error.propertyName + ': ' + error.errorMessage;
            });
            alert("Error: " + e);
          });
        } catch (ex) {
          alert("Error: " + e);
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
        if (id === data.currentTree().Id()) {
          return data.currentTree();
        }
        else {
          return item;
        }
      }
    }
    //for (var j = 0; j < data.trees.length; j++) {
    //  if (id === data.trees()[i].Id()) {
    //    return data.trees()[i];
    //  }
    //}

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