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
    canActivate: canActivate,
    activate: activate,

  };
  return vm;

  function canActivate(data, queryString) {
  	return true;
  } //canActivate

  function activate(data, queryString) {
  	logger.log('View activated', 'lightbox');
  } //activate

}); //define
