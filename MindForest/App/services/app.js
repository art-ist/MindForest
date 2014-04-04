define([
  //'durandal/system',
  'services/logger',
  'services/data',
  'plugins/router'
], function (logger, data, router) {

  var app = {
    initialize: initialize,

    //Properties

    data: data,
    map: null,

    user: {
      name: ko.observable('Anonymous'),
        //id: new ko.observable('0'),

      roles: ko.observableArray([]),

      isInRole: function (role) {
        return (app.user.roles().indexOf(role) > -1);
      },

      //Permissions
      mayEdit: ko.computed(function () {
        return (app.user && thisapp.user.isInRole('Authors'));
      }, this, { deferEvaluation: true }), //ATTENTION: must deferEvaluation because in the initial run app is not yet defined

      isAuthenticated: ko.computed(function () {
        return (app.user && (app.user.name() !== 'Anonymous'));
      }, this, { deferEvaluation: true }) //ATTENTION: must deferEvaluation because in the initial run app is not yet defined
    }, //user

    state: {
      edit: ko.observable(false)
    },
    detailsVisible: false,

    settings: {
      map: ko.observable('mm'), //default now set in index.js (until init works)
      animationDuration: ko.observable(500),
      cycleNavigation: ko.observable(false),
      autoScroll: ko.observable(true),
      detailsStyle: ko.observable('tool-right'), // , lightBox
      appBar: ko.observable('hide'),
      mm: {
        zoom: ko.observable(1)//,
        //wrapItems: new ko.observable(false)
      }
    }, //settings

    //Methods
    login: login,
    logout: logout,

    select: select,
    selectNextSibling: selectNextSibling,
    selectPreviousSibling: selectPreviousSibling,
    selectFirstChild: selectFirstChild,
    selectFirstParent: selectFirstParent,

    showForest: showForest,
    hideForest: hideForest,
    openTree: openTree,
    toggleDetails: toggleDetails,
    showWebPage: showWebPage,
    hideWebPage: hideWebPage,
    toggleEdit: toggleEdit,

    addChild: addChild,
    addSibling: addSibling,
    cloneNode: cloneNode,
    moveNode: moveNode,
    addDetail: addDetail,
    deleteNode: deleteNode,
    deleteDetail: deleteDetail,

    undo: undo,
    save: save

  }
  return app;


  function initialize() {
    logger.log('app initializing', '_app');

    data.initialize();

    //hook global up keyboard functions
    document.onkeypress = function (event) {
      //see http://javascript.info/tutorial/keyboard-events

      if (event.isDefaultPrevented) {
        return false;
      }

      // get the key event.type must be keypress
      var key = event.charCode ? event.charCode: event.keyCode ? event.keyCode: 0;
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
      switch(key) {
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
        if (char === 'N') { // ctrl+N ... new child
          event.preventDefault(); //prevent default behaviour
          if(edit) app.addChild();
          return false;
        }
        if (char === 'M') { // ctrl+M ... new sibling
          event.preventDefault(); //prevent default behaviour
          if (edit) app.addSibling();
          return false;
        }
        if (event.shiftKey && char === 'C') { // ctrl+shift+C ... clone current node
          event.preventDefault(); //prevent default behaviour
          if (edit) app.cloneNode();
          return false;
        }
        if(char === 'S') { // ctrl+S ... save
          event.preventDefault(); //prevent default behaviour
          if (edit) app.save();
          return false;
        }
        if (char === 'Z') { // ctrl+Z ... undo (unsaved) changes
          event.preventDefault(); //prevent default behaviour
          if (edit) app.undo();
          return false;
        }
      } //if (event.ctrlKey)

      return true;
    }; //document.onkeypress

    //TODO: fix modal dialog keyboard shortcuts
    //hook up modal dialog keyboard shortcuts
    $('#login.modal').keypress(function (event) {
      if (event.which === 13) {
        event.preventDefault(); //prevent default scrolling behaviour
        $(this).children('.btn-primary')[0].onclick;
        return false;
      }
    });

  } //initialize


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
      app.data.login(
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
      app.data.logout();
      app.user.name('Anonymous');
      app.user.roles.removeAll();
    } //logout

    //#endregion security

    //#region select items

    function select(connection) {
      //if (!connection.ToNode) return;
      if (connection.ToNode() !== app.data.currentConnection().ToNode() || !app.detailsVisible) {
        app.data.loadNodes(connection.ToNode(), true);
      }
      app.data.currentConnection(connection);

      if (app.settings.autoScroll()) {
        /*app.map*/ $.scrollTo('node-' + connection.ToNode().Id());
      }
      return connection;
    } //select

    function selectNextSibling() {
      if (!app.select) return;
      var currCon = app.data.currentConnection();
      var parent = app.data.findNodeById(currCon.FromId());
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
      if (!app.select) return;
      var currCon = app.data.currentConnection();
      var parent = app.data.findNodeById(currCon.FromId());
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
      if (!app.select) return;
      var currCon = app.data.currentConnection();

      if (currCon.HasChildren()) {
        app.map.expandNode(currCon, null, 0);
      }

    } //selectFirstChild
    function selectFirstParent() {
      if (!app.select) return;
      var currCon = app.data.currentConnection();
      var parentCon = app.data.getParentConnection(currCon.FromId());
      if (parentCon) {
        app.select(parentCon);
      }
    } //selectFirstParent

    //#endregion select items

    function showForest(mode) {
      //if (!app.data.trees().length) {
      app.data.loadTrees();
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

    function openTree(item, event) {
      var mapName = app.settings.map();
      app.data.currentTree(item);
      router.navigate('#/' + mapName);
    } //openTree

    var detailsLoaded = false;
    function toggleDetails(show) {
      if (show === 'show') app.detailsVisible = false;
      if (show === 'hide') app.detailsVisible = true;

      var effect = app.settings.detailsStyle() === 'tool-right'
                   ? { effect: 'slide', direction: 'right', duration: app.settings.animationDuration() }
                   : app.settings.detailsStyle() === 'lightBox'
                   ? { effect: 'fade', duration: app.settings.animationDuration() }
                   : null
      ;

      if (app.detailsVisible) { //hide
        //console.log("hideDitails");
        $('#detailsPage')
          .hide(effect); // 'slide', { direction: 'right' }, app.settings.animationDuration()
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
      $('#webPage-title').text(data.Title());
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
      var newConnection = app.data.addNode(app.data.currentConnection().ToNode(), null, "project", false, app.data.currentConnection());
      app.select(newConnection);
    } //addChild

    function addSibling() {
      //var nodeId = app.data.currentConnection().ToNode().Id();
      //var nodeUniqueId = app.data.currentConnection().ToNode().UniqueId();
      //var parentCon = app.data.getParentConnection(nodeId, nodeUniqueId);
      var currCon = app.data.currentConnection();
      var parent = app.data.findNodeById(currCon.FromId());
      //var parentCon = app.data.getParentConnection(parent.Id(), parent.UniqueId());
      var newConnection = app.data.addNode(parent, currCon.Position(), "project", null);
      app.select(newConnection);
    } //addSibling 

    function cloneNode() {
      //// Shallow copy
      //var newObject = jQuery.extend({}, oldObject);
      //// Deep copy
      //var newObject = jQuery.extend(true, {}, oldObject);

      var currentConnection = app.data.currentConnection();
      var currentNode = currentConnection.ToNode();
      var parent = app.data.findNodeById(currCon.FromId());
      var newConnection = app.data.addNode(parent, currCon.Position(), currentNode.class, null);
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
        app.data.addConnection(
          newNode,
          currentNode.ChildConnections()[i].ToNode(),
          null,
        false
      );
        //ToDo: copy connection properties
      }

      //copy details
      for (var j = 0; j < currentNode.Details().length; j++) {
        var detail = currentNode.Details()[j];
        var newConnection = app.data.addNode(
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

      movingConnection.FromId(toParentChildren.Id); //change FromId to new Parent

      var childConnections = toParentChildren();
      for (var i = 0; i < childConnections.length; i++) { //iterate Children to set Position to current index in array
        childConnections[i].Position(i);
      }
    } //moveNode

    function addDetail(klasse) {
      var newConnection = app.data.addNode(app.data.currentConnection().ToNode(), null, klasse, true);
      if (klasse === "details_link") {
        newConnection.ToNode().Title("New Link Text");
        newConnection.ToNode().Link("New Link");
      }
      else {
        newConnection.ToNode().Title("New Description");
      }
      //app.data.loadDetails(app.data.currentConnection().ToNode());
    } //addDetail

    function deleteNode() {
      app.data.setDeleted();
      app.data.saveChanges();
      //only marked as Deleted not realy deleted in DB (saveChanges required)
      //ToDo: UI Feedback that Node is set Deleted
    } //deleteNode

    function deleteDetail(item) {
      var parentCon = app.data.getParentConnection(item.Id(), item.UniqueId());
      app.data.setDetailDeleted(item, parentCon);
      //Detete Current detail
      app.data.saveChanges();
    } //deleteDetail

    function undo() {
      return app.data.undoChanges();
      //todo restore ui (-> moves)
    } //undo

    function save() {
      return app.data.saveChanges();
    } //save

    //app.linkNode = function () {}

    //#endregion edit

    //#endregion Methods

    //#region Private Functions

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


});