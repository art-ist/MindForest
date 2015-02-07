define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {

  var vm = {
    //Properties
    app: app,

    //Lifecycle Events
    compositionComplete: compositionComplete,

  	//Methods
    login: login

  };
  return vm;

  function compositionComplete(data, queryString) {
  	//logger.log('View compositionComplete', 'login', $('#login .action-select'));
  	$('#login').on('shown.bs.modal', function (e) {
  		$('#login .action-select')
			.select()
  		;
  	});
  } //activate

  function login() {
  	app.login($('#login-name').val(), $('#login-pwd').val());
  	$('#login').modal('hide');
  }

}); //define
