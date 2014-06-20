define([
  'services/logger',
  'services/app'
], function (logger, app) {

  var vm = {
    //Properties
    app: app,

    connection: app.mind.currentConnection(),
    node: app.mind.currentConnection() ? app.mind.currentConnection().ToNode() : null,

    //Lifecycle Events
    //canActivate: canActivate,
  	//activate: activate,
    compositionComplete: compositionComplete

  };
  return vm;

  //function canActivate(data, queryString) {
  //	return true;
  //} //canActivate

  //function activate(data, queryString) {
  //	logger.log('View activated', 'dock');
  //} //activate

  function compositionComplete(view, parent) {
  	logger.log('Composition complete', 'dock', view);
  	$('#detailsPage')
		.addClass(view);
		//.show(effect); //'slide', { direction: 'right' }, app.settings.animationDuration()
  }

}); //define
