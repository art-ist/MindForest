define([
  'require',
  'durandal/system',
  'services/logger'
], function (require, system, logger) {

  //#region Private Fields

  var authServiceUri = config.host + '/api{forest}Identity';

  //var authentication = {
  //  scheme: 'Basic',
  //  token: null,
  //  setToken: function (uid, pwd) {
  //    authentication.token = Base64.encode(uid + ":" + pwd);
  //  }
  //};

  //#endregion Private Fields

  var auth = {
    initialize: initialize,

    //Properties

    //Methods
    login: login,
    logout: logout
  };


  //#region Constructor

  ////set computed properties that require context 

  //// add basic auth header to breeze calls
  //var ajaxAdapter = breeze.config.getAdapterInstance("ajax");
  //ajaxAdapter.defaultSettings = {
  //  beforeSend: function (xhr, settings) {
  //    _addAuthorizationToken(xhr, settings);
  //  }
  //};

  //#endregion Constructor
  return auth;

  function initialize(app) {
    authServiceUri = authServiceUri.replace(/{forest}/,  app.forest ? '/' + app.forest + '/': '/');    
  }

  //#region Private Functions

  function _addAuthorizationToken(xhr, settings) {
    if (authentication.token) {
      xhr.setRequestHeader("Authorization", 'Basic ' + authentication.token);
    }
  }

  //#endregion Private Functions


  //#region Methods

  function login(username, password, success, error) {
    //console.log("[mind - login] logging in '" + username + "' with password '" + password + "', token: " + Base64.encode(username + ":" + password));
    authentication.setToken(username, password);
    $.ajax({
      type: "GET",
      url: authServiceUri + "/Get",
      beforeSend: function (xhr, settings) {
        _addAuthorizationToken(xhr, settings);
      },
      success: function (result) {
        console.log('[mind.js - login] result', result);
        success(result);
      },
      error: function (err) {
        logger.error('Login failed. ' + err.login, 'mind - loadTrees');
      }
    }); //ajax
  } //login

  function logout() {
    authentication.token = null;
  } //logout

  //#endregion Methods

});