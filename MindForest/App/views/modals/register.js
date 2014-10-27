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
    register: register

  };
  return vm;

  function compositionComplete(data, queryString) {
  	$('#register').on('shown.bs.modal', function (e) {
  		$('#register .action-select')
			.select()
  		;
  	});
  } //activate

  function register() {
  	app.register($('#register-username').val(), $('#register-email').val(), $('#register-password'), $('#register-confirm'));
  	$('#register').modal('hide');
  }

}); //define
