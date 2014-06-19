define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {

  var vm = {
    //Properties
    app: app,

    connection: mind.currentConnection(),
  	node: mind.currentConnection().ToNode(),

    //Lifecycle Events
    canActivate: canActivate,
    activate: activate,

  };
  return vm;

  function canActivate(data, queryString) {
  	return true;
  } //canActivate

  function activate(data, queryString) {
  	logger.log('activating', 'dock');
  } //activate

}); //define
