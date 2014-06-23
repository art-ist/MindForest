define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {

  var outline = {
    //Properties
    title: mind.currentTree().Text().Title,
    app: app,
    mind: mind,

    //Lifecycle Events
    canActivate: canActivate,
    activate: activate,

    //Methods
    nodeClick: nodeClick,
    expandNode: expandNode,
    showDetails: showDetails,

    afterMoveNode: afterMoveNode

  };
  return outline;

  function canActivate(treeName, queryString) {
  	return app.canOpenTreeByName(treeName, 'outline');
  } //canActivate

  function activate(treeName, queryString) {
  	outline.app.map = outline;
  	var rootNode = mind.currentTree();
  	mind.loadChildren(rootNode, true);
  } //activate

  //#region Methods

  function nodeClick(conn, event) {
  	var wasSelected = app.isSelected(conn);
  	app.select(conn);

    if (conn.ToNode && conn.ToNode().hasChildren()) { //intermediate level -> expand
    	expandNode(conn);
    }
    else {	//leaf -> show details
      if (!app.detailsVisible) {
      	showDetails(conn, event);
      }
      else if (wasSelected) {	//app.detailsVisible && wasSelected
        app.toggleDetails('hide');
      }
    }
  } //nodeClick

  function expandNode(con, selectChild) {
  	if (!(selectChild >= 0)) {
  		app.select(con);  //mind.currentConnection(con);
  	}
  	if (!con.isExpanded() || selectChild >= 0) { //expand
  		//logger.log("mm expandNode expand before: " + con.isExpanded(), con);
  		con.isExpanded(true);
  		//if (con.ToNode().ChildConnections().length === 0) {

  		//else {
  			logger.log('mm expandNode without data.loadChildren', { con: con, selectChild: selectChild });
  			if (selectChild >= 0) {
  				app.select(con.ChildConnections()[selectChild]);  //mind.currentConnection(con.ChildConnections()[selectChild]);
  			}
  		//}
  	}
  	else { //collapse
  		//-logger.log("mm expandNode collapse " + con.isExpanded(), con);
  		con.isExpanded(false);
  	} //if
  } //expandNode

  function showDetails(item, event) {
    if (item.ToNode() !== mind.currentConnection().ToNode() || !app.detailsVisible) {
      //mind.loadChildren(item.ToNode(), true);
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
