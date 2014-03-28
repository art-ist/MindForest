/// <reference path="../jquery-1.8.2.js" />
/// <reference path="../app.js" />
/// <reference path="../../index.html.js" />
/// <reference path="forestModel.js" />

/* region ViewModels */
function treeModel() {
  /* Data */
  var self = this;
  self.nodes = new ko.observableArray([]);
  self.connections = new ko.observableArray([]);
  //self.selectedNode = null;
  self.title = new ko.observable();
  self.currentNode = new ko.observable();

  /* Behavours */

  var pars = $.requestParameters();
  var lang = pars['lang'] ? '&Lang=' + pars['lang'] : ''; 
  var forest = pars['forest'] ? '&Forest=' + pars['forest'] : '';
  self.loadNodes = function (fromNodeId, target) {
    $.ajax({
      type: "GET",
      url: "/MindForestService.svc/GetChildNodes?NodeId=" + fromNodeId + forest + lang, //"&Levels=1" 
      success: function (result) {
        var data;
        ////nodes
        //data = result.d.Nodes;
        //if (data == "") {
        //  self.nodes([]);
        //  return;
        //}
        //self.nodes([]);
        //for (var i = 0; i < data.length; i++) {
        //  var item = new Node(data[i]);
        //  self.nodes.push(item);
        //}
        //connections
        data = result.d.Connections;
        if (data == "") {
          target([]);
          return;
        }
        target([]);
        for (var i = 0; i < data.length; i++) {
          var con = new Connection(data[i]);
          //oder//var item = data[i];

          //oder//nd.ChildConnections = new observableArray([]);
          var nd = new Node(findNodeById(result.d.Nodes, con.ToId()));
          //oder//var nd = findNodeById(self.nodes, item.ToId());

          //var ndJs = ko.toJS(nd);
          con.ToNode(nd);
          con.cIsExpanded = new ko.observable(false);
          target.push(con);
        }
      },
      error: function (errMsg) {
        alert(errMsg.responseText);
      }
    }); //ajax
  }; //loadNodes

  self.loadDetails = function (fromNodeId, target) {
    //call: self.loadDetails(data.ToId(), data.ToNode().Details);
    $.ajax({
      type: "GET",
      url: "/MindForestService.svc/GetNodeDetails?NodeId=" + fromNodeId + forest + lang,
      success: function (result) {
        var data;
        //connections
        data = result.d;
        if (data == "") {
          target([]);
          return;
        }
        target([]);
        for (var i = 0; i < data.length; i++) {
          target.push(data[i]);
        }
      },
      error: function (errMsg) {
        alert(errMsg.responseText);
      }
    }); //ajax
  }; //loadDetails



  self.clearNodes = function () {
    alert("clearNodes not implemented - will clear all nodes after checking for unsaved changes");
  };

  self.nodeClick = function (data, event) {
    //alert(ko.toJSON(data));
    //alert('treeModel.nodeClick');
    self.currentNode(data.ToNode());
    if (data.HasChildren()) {
      self.expandNode(data, event);
    }
    else {
      //self.loadDetails(data.ToId(), data.ToNode().Details);
      self.showDetails(data, event);
    }
  };

  self.expandNode = function (data, event) {
    //alert(ko.toJSON(Node));
    if (data.cIsExpanded()) {
      data.cIsExpanded(false);
    }
    else {
      //if (Node.Children.length = 0) {
      self.loadNodes(data.ToId(), data.ToNode().ChildConnections);
      //}
      data.cIsExpanded(true);
    }
  }; //expandNode

  self.showDetails = function (data, event) {
     //self.loadDetails(data.ToId(), data.ToNode().Details);

    //alert('treeModel.showDetails')
    if (data.ToNode() === this.currentNode) {
      app.toggleDetails();
    } else {
      app.toggleDetails('show'); 
    }
  }

  //self.showWebPage = function (data, event) {
  //  alert('treeModel.showWebPage')
  //  var url = data.ToNode().attr('href');
  //  $('#webContent').attr('src', url);
  //  $('#webPage').show('slide', { direction: 'right' }, animationDuration);
  //  return false;
  //}
  //self.hideWebPage = function (data, event) {
  //  $('#webPage').hide('slide', { direction: 'right' }, animationDuration);
  //  return false;
  //}

  //online
  self.addNode = function (parentNodeId, afterNodeId, newNode, newConnection) { alert("addNode not yet implemented"); };
  self.addConnection = function (fromNodeId, toNodeId, newConnection) { alert("addConnection not yet implemented"); };

  self.updateNode = function (node) { alert("updateNode not yet implemented"); };

  self.deleteNode = function (parentNodeId, nodeToBeDeletedId) { alert("deleteNode not yet implemented"); };
  self.deleteConnection = function (fromNodeId, toNodeId) { alert("deleteConnection not yet implemented"); };

  //offline
  self.saveChanges = function () { alert("Save not yet implemented - will save all loacl changes to the store"); };
  self.saveChanges = function () { alert("Save not yet implemented - will update all loacl data from to the store"); };

  ////Client side routes
  //Sammy(function () {
  //  this.get('#:item', function () {
  //    //self.selectedNode = this.params.item;
  //  }); //#:item
  //  this.get('', function () {
  //    self.loadRoot();
  //  }); //''
  //}).run();

} //treeModel