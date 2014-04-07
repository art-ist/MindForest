define([
  'durandal/system',
  'services/app',
  'services/logger'
], function (system, app, logger) {

  //#region Private Fields


  //var newNodesId = -1;

  var pars = $.requestParameters();
  var forest = window.location.pathname
  forest = pars['forest']
         ? pars['forest']

         : "";
  var lang = pars['lang'] ? pars['lang'] : '%';

  var mindServiceUri = forest
                     ? config.host + '/api/' + forest + '/Mind'
                     : config.host + '/api/Mind';
  var mindContext = new breeze.EntityManager(mindServiceUri);
  //var mindMetadata = new breeze.MetadataStore(); //see: http://www.breezejs.com/documentation/naming-convention
  var mindMetadata = mindContext.metadataStore;
  var mindMetadataFetched = false;
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
    var Node = function () {
      var eventRate = { rateLimit: 50, method: "notifyWhenChangesStop" }; //rateLimit: notify of changes max every XX ms, delay until no change for XX ms 
      //server extensions
        //this.MaxChildPosition = ko.observable(null);
      //client extensions
      this.Details = ko.observableArray();            this.Details.extend(eventRate); 
      this.ChildConnections = ko.observableArray();   this.ChildConnections.extend(eventRate); 
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
        return this === data.currentConnection();
      }, this);
    }
    mindMetadata.registerEntityTypeCtor("Connection:#MindForest.Models", Connection);

  } //extendEntities

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
        logger.error('Login failed. ' + err.login, 'data - loadTrees');
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
    var query = new breeze.EntityQuery()
        .from("GetTrees")
        .withParameters({ Lang: lang, Forest: forest });

    return mindContext.executeQuery(query)
      .then(function (result) {
        //result.results.forEach(function (item) {
        //    data.trees.push(item);
        //}); //result.results.forEach
        logger.log('Trees loaded', 'data - loadTrees', result.results);
        data.trees(result.results);
      })
      .fail(function (ex) {
        logger.error('Could not load trees. ' + ex , 'data - loadTrees');
      })
    ; //mindContext.executeQuery(query)

  } //loadTrees

  function loadNodes(FromNode, selectChild) {

    var query = new breeze.EntityQuery()
        .from("GetChildNodes")
        .withParameters({
          Lang: lang,
          Forest: forest,
          NodeId: FromNode.Id(),
          Levels: "1"
        });
    query.tag = { FromNode: FromNode, selectChild: selectChild };

    return mindContext.executeQuery(query)
      .then(function (result) {
        //result.results
        //  .forEach(function (item) {
        //    if (getCachedConnections(item.FromId, item.ToId) === null) {
        //      if (item.IsVisible) {
        //        FromNode.ChildConnections.push(item);
        //      }
        //      else {
        //        FromNode.Details.push(item.Node);
        //      }
        //    }
        //    //else { console.log("item alredy attached"); }
        //  }); //result.results.forEach
        ////return result.query.tag;
        FromNode.ChildConnections = ko.observableArray(
          ko.utils.arrayFilter(result.results, function(item) {
            return true; //item.IsVisible;
          })
        );
        FromNode.Node = ko.observableArray(
          ko.utils.arrayFilter(result.results, function(item) {
            return !item.IsVisible;
          })
        );
        logger.log('children of ' + FromNode.Id() + ' loaded', 'data - loadNodes', { FromNode: FromNode, restuls: result.results, });
      }) //then
      .fail(function (ex) {
        logger.error(ex, 'data - loadNodes');
      })
    ; //mindContext.executeQuery(query)


  } //loadNodes

  function loadDetails(node) {

    var query = new breeze.EntityQuery()
        .from("GetNodeDetails")
        .withParameters({ Lang: lang, Forest: forest, NodeId: node.Id() });

    mindContext.executeQuery(query)
      .then(function (result) {
        result.results.forEach(function (item) {
          if (mindContext.getEntityByKey("Node", item.UniqueId) === null) {
            node.Details.push(item);
          }
        });
      }).fail(function (e) {
        logger.error(ex, 'data - loadDetails');
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
        logger.success("Saved", 'SUCCESS|data - saveChanges')
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
          logger.error("Saving failed! " + e, 'data - saveChanges');
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