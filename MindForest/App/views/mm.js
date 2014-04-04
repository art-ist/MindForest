define([
  'services/logger',
  'services/app'
], function (logger, app) {

  var mm = {

    //Properties
    title: ko.observable(),
    app: app,
    data: app.data,
    
    zoom: app.settings.mm.zoom,

    //Lifecycle Events
    activate: activate,
    attached: attached,

    //Methods
    nodeClick: nodeClick,
    expandNode: expandNode,
    showDetails: showDetails,
    afterNodeMove: afterNodeMove,

    zoomIn: zoomIn,
    zoomOut: zoomOut,
    setZoom: setZoom,

    afterBindingRenderedTemplate: afterBindingRenderedTemplate,
    afterBindingAddedElement: afterBindingAddedElement,
    beforeBindingRemovedElement: beforeBindingRemovedElement

  };
  return mm;

  //#region Private Fields
  var self = this;

  var pars = $.requestParameters();
  var lang = pars['lang'] ? '&Lang=' + pars['lang'] : '';
  var forest = pars['forest'] ? '&Forest=' + pars['forest'] : '';

  //handle doubleclick
  var clickDelay = 200,
      clickCount = 0,
      clickTimer = null;

  var plumb = null;

  //#endregion Private Fields

  function activate() {

    var rootNode = app.data.currentTree();
    logger.log('mirisfad', 'mm - activate', rootNode);
    app.data
      .loadNodes(rootNode, true)
      .then(function () {

        plumb = jsPlumb.getInstance({
          //Container: 'mm-container',
          Connector: ["Bezier", { curviness: 30, cssClass: 'mm-connector' }],
          //Connector: ["StateMachine", { curviness: 10, margin: 5, proximityLimit: 15, cssClass: 'mm-connector' }],
          Anchors: [ "Right", "Left" ],
          Endpoint: ["Blank", {}],
          //Endpoints: [["Dot", { radius: 3 }], ["Dot", { radius: 3 }]],
          PaintStyle: {
            lineWidth: 2,
            strokeStyle: "#999"
          }
        });

      });


  } //activate

  function attached() {
    var container = document.getElementById('mm');
    //-logger.log('mm init', container);

    //container.contentEditable=true;
    //container.onkeypress = function (event) {
    //  if (!event) event = window.event;
    //  var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
    // //-logger.log('mm keypress: key ' + key);
    //  if (key === 37 || key === 38 || key === 39 || key === 40) {
    //    switch (key) {
    //      case 37:
    //        app.selectFirstParent();
    //        break;
    //      case 38:
    //        app.selectPreviousSibling();
    //        break;
    //      case 39:
    //        app.selectFirstChild();
    //        break;
    //      case 40:
    //        app.selectNextSibling();
    //        break;
    //    }
    //    event.preventDefault();
    //    return false;
    //  }
    //  return true;
    //}

    //set zoom
    if (app.settings.mm.zoom() !== 1) {
      self.setZoom(app.settings.mm.zoom());
    }

    //center map
    //$(window).scrollTo('#mm-container', '50%', 500);

    //create root lines
    //createLines(self.data.currentTree());
    //container.focus();

    //init zoom-slider
    /*var slider = */
    //$("#mm-zoom-slider").slider({
    //  min: 0.2,
    //  max: 2,
    //  value: app.settings.mm.zoom(),
    //  slide: function (event, ui) {
    //    self.setZoom(ui.value);
    //  }
    //});
    //$("#mm-zoom-textbox").change(function () {
    //  slider.slider("value", this.selectedIndex + 1);
    //});
    //slider

  }; //attached


  //#region Private Functions

  ///Connects all child-nodes of the given node with a new line
  function createLines(FromNode) {
    jsPlumb.doWhileSuspended(function () {
      var from = 'node-' + FromNode.Id();
      var container = 'container-' + FromNode.Id();
      //logger.log('mm creating ' + FromNode.ChildConnections().length + ' lines for ' + from);
      for (var i = 0; i < FromNode.ChildConnections().length; i++) {
        var to = 'node-' + FromNode.ChildConnections()[i].ToId();
        //logger.log('mm creating line: ' + from + ' -> ' + to);
        FromNode.ChildConnections()[i].line
          = self.plumb.connect({
          source: from,
          target: to,
          container: container
        });
      }
    });
  }

  ///Creates a line for a given connection (connectiong two nodes)
  function createLine(Connection) {
    var from = 'node-' + Connection.FromId();
    var container = 'container-' + Connection.FromId();
    var to = 'node-' + Connection.ToId();
    Connection.line
          = self.plumb.connect({
            source: from,
            target: to,
            container: container
          });
    //logger.log('creating line ' + Connection.FromId() + ' - ' + Connection.ToId());
  }

  ///Removes all 'child'-lines from a given node
  function removeLines(FromNode) {
    jsPlumb.doWhileSuspended(function () {
      var from = '#node-' + FromNode.Id();
     //-logger.log('mm removing lines for ' + from);
      for (var i = 0; i < FromNode.ChildConnections().length; i++) {
        var line = FromNode.ChildConnections()[i].line;
        if (line) {
          self.plumb.detach(line);
          line = null;
        }
      }
    });
  }

  ///Removes the line assigned to a single connection
  function removeLine(Connection) {
    //logger.log('removing line ' + Connection.FromId() + ' - ' + Connection.ToId());
    if (Connection.line) {
      self.plumb.detach(Connection.line);
      Connection.line = null;
    }
  }

  ///Repaints all lines in the diagram
  function repaintLines(FromId) {
    var from = 'node-' + FromId;
    //logger.log('mm repainting lines for ' + from);
    //self.plumb.repaint(from);
   //-logger.log('mm repainting all lines because of ' + from);
    self.plumb.repaintEverything();
  }

  //#endregion Private Functions

  //#region Methods

  function nodeClick(item, event) {

    //app.data.currentConnection(item);

    ////handle doubleklick
    //clickCount++;  //count clicks
    //if (clickCount === 1) {
    //  clickTimer = setTimeout(function () {
    //   //-logger.log("mm NodeClick click");

        //click
        if (item.HasChildren()) {
          //logger.log("mm NodeClick before expandNode", item);
          self.expandNode(item, event);
        }
        else {
          //logger.log("mm NodeClick before showDetailsNode", item);
          app.data.currentConnection(item);
          self.showDetails(item, event);
        }
        //click

    //    clickCount = 0;  //after action performed, reset counter
    //  }, clickDelay);
    //}
    //else {
    //  clearTimeout(clickTimer);  //prevent single-click action
    // //-logger.log("mm NodeClick dblClick");

    //  //dblClick
    //  self.showDetails(item, event);
    //  //dblClick

    //  clickCount = 0;  //after action performed, reset counter
    //}

  } //nodeClick

  function expandNode(item, event, selectChild) {
    if (!(selectChild >= 0)) {
      app.data.currentConnection(item);
    }
    if (!item.cIsExpanded() || selectChild >= 0) { //expand
      //logger.log("mm expandNode expand before: " + item.cIsExpanded(), item);
      item.cIsExpanded(true);
      if (item.ToNode().ChildConnections().length === 0) {

        //var defered = Q.defer();
        app.data
          .loadNodes(item.ToNode(), selectChild)
          .then(function (result) {
           //-logger.log('mm expandNode after data.loadNodes', { item: item, selectChild: selectChild });
            repaintLines(result.FromNode.Id());
            //createLines(result.FromNode);   //creating the line on afterBindingAddedElement
            if (result.selectChild >= 0) {
              app.data.currentConnection(item.ToNode().ChildConnections()[result.selectChild]);
            }
          })
        ;
        //return defered.promise;
      }
      else {
        logger.log('mm expandNode without data.loadNodes', { item: item, selectChild: selectChild });
        setTimeout(function () {
          createLines(item.ToNode());
          repaintLines(item.FromId());
        }, 500);
        if (selectChild >= 0) {
          app.data.currentConnection(item.ToNode().ChildConnections()[selectChild]);
        }
      }
    }
    else { //collapse
     //-logger.log("mm expandNode collapse " + item.cIsExpanded(), item);
      removeLines(item.ToNode());
      item.cIsExpanded(false);
      setTimeout(function () {
        repaintLines(item.FromId());
      }, 500);      
    } //if
  } //expandNode

  function showDetails(item, event) {
    if (item.ToNode() !== app.data.currentConnection().ToNode() || !app.detailsVisible) {
      app.data.loadNodes(item.ToNode(), true);
      app.toggleDetails('show');
    }
    else {
      app.toggleDetails('hide');
    }
  } //showDetails

  function afterNodeMove(arg) {
    // arg.item ... connection moved
    // arg.sourceParent ... children Collection of source parent
    // arg.targetParent ... children Collection of target parent
    // arg.sourcetIndex ... position in source collection
    // arg.targetIndex ... position in target collection
    self.app.moveNode(arg.item, arg.targetParent); /*, arg.targetIndex + 1*/
  } //afterNodeMove

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
    plumb.setZoom(factor);
    app.settings.mm.zoom(factor);
  } //setZoom

  function afterBindingRenderedTemplate(elements, data) {
    //logger.log('afterBindingRenderedTemplate | ' + data.ToId());
  } //afterBindingRenderedTemplate

  function afterBindingAddedElement(element, index, data) {
    if ($(element).html()) {
      //logger.log('afterBindingAddedElement | ' + data.ToId());//+ ' | ' + $(element).html());
      createLine(data);
    }
  } //afterBindingAddedElement

  function beforeBindingRemovedElement(element, index, data) {
    //logger.log('beforeBindingRemovedElement | ' + data.ToId());
    removeLine(data);
  } //beforeBindingRemovedElement

  //#endregion Methods


}); //define