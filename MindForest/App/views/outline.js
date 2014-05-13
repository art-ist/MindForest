define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {

  var outlineModel = {
    //Properties
    title: mind.currentTree().Text().Title,
    app: app,
    mind: mind,

    //Lifecycle Events

    //Methods
    nodeClick: nodeClick,
    expandNode: expandNode,
    showDetails: showDetails,

    afterMoveNode: afterMoveNode

  };
  return outlineModel;


  //var self = this;

  //#region Private Fields

  //var pars = $.requestParameters();
  //var lang = pars['lang'] ? '&Lang=' + pars['lang'] : '';
  //var forest = pars['forest'] ? '&Forest=' + pars['forest'] : '';

  //#endregion Private Fields


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
  		mind.currentConnection(con);
  	}
  	if (!con.isExpanded() || selectChild >= 0) { //expand
  		//logger.log("mm expandNode expand before: " + con.isExpanded(), con);
  		con.isExpanded(true);
  		//if (con.ToNode().ChildConnections().length === 0) {

  		//	//var defered = Q.defer();
  		//	mind
		//	  .loadChildren(con.ToNode(), selectChild)
		//	  .then(function (result) {
		//	  	//-logger.log('mm expandNode after data.loadChildren', { con: con, selectChild: selectChild });
		//	  	if (result.selectChild >= 0) {
		//	  		mind.currentConnection(con.ToNode().ChildConnections()[result.selectChild]);
		//	  	}
		//	  })
  		//	;
  		//	//return defered.promise;
  		//}
  		//else {
  			logger.log('mm expandNode without data.loadChildren', { con: con, selectChild: selectChild });
  			if (selectChild >= 0) {
  				mind.currentConnection(con.ToNode().ChildConnections()[selectChild]);
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
