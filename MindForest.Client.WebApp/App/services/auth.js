define([
  'require',
  'durandal/system',
  'services/logger'
], function (require, system, logger) {

	//#region Private Fields

	var authServiceUri = config.host + '/api{forest}Identity';

	//#endregion Private Fields

	var auth = {
		initialize: initialize,

		//Properties
		app: null,

		//Methods
		login: login,
		logout: logout,
		register: register
	};

	//#region Constructor
	//#endregion Constructor

	return auth;

	function initialize(app) {
		auth.app = app;
		//authServiceUri = authServiceUri.replace(/{forest}/, app.forest ? '/' + app.forest + '/' : '/');
		authServiceUri = authServiceUri.replace(/{forest}/, '/');

		// add auth header to breeze calls
		var ajaxAdapter = breeze.config.getAdapterInstance("ajax");
		ajaxAdapter.defaultSettings = {
			beforeSend: function (xhr, settings) {
				if (app.user.access_token()) {
					xhr.setRequestHeader("Authorization", 'Bearer ' + app.user.access_token());
				}
			}
		};
	}

	//#region Private Functions
	//#endregion Private Functions

	//#region Methods

	function login(username, password) {
		return $.ajax({
			type: "POST",
			url: authServiceUri + "/Login",
			contentType: 'application/x-www-form-urlencoded',
			data: 'grant_type=password&username=' + username + '&password=' + password,
		}).done(function (result, textStatus, jqXHR) {

			//function success(claims) {
			//	$.each(claims, function (i, claim) {
			//		switch (claim.Type) {
			//			case "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
			//				app.user.name(claim.Value);
			//				break;
			//			case "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
			//				app.user.roles.push(claim.Value);
			//				break;
			//		}
			//	});
			//	console.log('[app.js - login] success', app.user);
			//}

			logger.success(result.userName + ' logged in', 'auth - login', result);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			logger.error('Login failed: ' + textStatus, 'auth - login', errorThrown);
		});
	} //login

	function logout() {
		var user = auth.app.user;
		user.name('Anonymous');
		//user.email(null);
		user.access_token(null);
		//user.roles.removeAll();
		user.roles([]);
		//server logout
		return $.ajax({
			type: "POST",
			url: authServiceUri + "/Logout"
		}).fail(function (jqXHR, textStatus, errorThrown) {
			logger.logError('Logout failed: ' + textStatus, 'auth - logout', errorThrown);
		}).always(function () {
			logger.info('Logged out');
		});
	} //logout

	function register(username, email, password, confirm) {
		return $.ajax({
			type: "POST",
			url: authServiceUri + "/Register",
			contentType: 'application/x-www-form-urlencoded',
			data: 'username=' + username + '&email=' + email + '&password=' + password + '&confirm=' + confirm,
		}).done(function (result, textStatus, jqXHR) {
			logger.success(username + ' registered successfullly', 'auth - register', result);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			logger.error('Registration failed: ' + textStatus, 'auth - register', errorThrown);
		});
	} //register

	//#endregion Methods

});