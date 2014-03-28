define([
  'services/logger',
  'services/app'
], function (logger, app) {

  var outlineModel = {
    //Properties
    title: app.data.currentTree().Title,
    app: app,
    data: app.data,

    //Lifecycle Events

    //Methods
    nodeClick: nodeClick,
    expandNode: expandNode,
    showDetails: showDetails,

    afterMoveNode: afterMoveNode

  };
  return outlineModel;


  var self = this;

  //#region Private Fields

  var pars = $.requestParameters();
  var lang = pars['lang'] ? '&Lang=' + pars['lang'] : '';
  var forest = pars['forest'] ? '&Forest=' + pars['forest'] : '';

  //#endregion Private Fields


  //#region Methods

  function nodeClick(item, event) {
    var isNotSameNode = (item.ToNode().Id() != app.data.currentConnection().ToNode().Id());
    if (isNotSameNode) {
      app.data.currentConnection(item);
      app.data.loadNodes(item.ToNode(), true);
    }
    if (item.HasChildren()) {
      expandNode(item, event);
    }
    else {
      if (!app.detailsVisible) {
        showDetails(item, event);
      }
      else if (!isNotSameNode) {
        app.toggleDetails('hide');
      }
    }
  } //nodeClick

  function expandNode(item, event) {
    app.data.currentConnection(item);
    //alert(ko.toJSON(Node));
    //-console.log("Expanded: " + item.cIsExpanded());
    if (item.cIsExpanded()) {
      item.cIsExpanded(false);
    }
    else {
      //if (Node.Children.length = 0) {

      app.data.loadNodes(item.ToNode());
      //}
      item.cIsExpanded(true);
    }
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

  function afterMoveNode(arg) {
    // arg.item ... connection moved
    // arg.sourceParent ... children Collection of source parent
    // arg.targetParent ... children Collection of target parent
    // arg.sourcetIndex ... position in source collection
    // arg.targetIndex ... position in target collection
    app.moveNode(arg.item, arg.targetParent/*, arg.targetIndex + 1*/);
  } //afterMoveNode

  //#endregion Methods

}); //define
