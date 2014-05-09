require.config({
  paths: {
    //'jquery'        : 'libraries/jquery-1.10.3',
    //'knockout'      : 'libraries/knockout-2.2.1',

    'text'          : 'libraries/text',
    'durandal'      : 'libraries/durandal',
    'plugins'       : 'libraries/durandal/plugins',
    'transitions'   : 'libraries/durandal/transitions',
    'services'      : 'services',

    'bootstrap'     : 'styles/themes/bootstrap'

    , urlArgs: "bust=" + (new Date()).getTime()
  },
  shim: {
    'bootstrap': {
      deps: ['jquery'],
      exports: 'jQuery'
    }
  }
});

//Durandal 2: http://durandaljs.com/documentation/Conversion-Guide/
define('jquery', function () { return jQuery; });
//define('knockout', ko);
define('knockout', [], function () { return window.ko; }); //see: http://stackoverflow.com/questions/13937539/breezejs-and-requirejs-not-working-as-expected

define([
  'durandal/system',
  'durandal/app',
  'durandal/viewLocator',
  'plugins/router',   //Achtung Aufruf über durandal/plugins/router löst wegen nicht eindeutigem pfad timeout fehler aus

  'services/app',
  'services/platform',
  'services/logger'
], function (system, durandal, viewLocator, router, app, platform, logger) {

    //specify which plugins to install and their configuration
    durandal.configurePlugins({
      router: true
      , dialog: true
      //, observable: true
      //, widget: true
      //, widget: {
      //    kinds: ['expander']
      //  }
    });

    window.onerror = function globalErrorHandler(msg, file, line) {
      logger.error(msg, file + ': ' + line);
    }

    //>>excludeStart("build", true);
    system.debug(true);     // Enable debug message to show in the console 
    logger.traceLevel = 2;  // Enable logging to output to console
    //>>excludeEnd("build");

    if (window.PhoneGap) {
      logger.log('running on PhoneGap', 'main');
      document.addEventListener("deviceready", onDeviceReady, false);
    } else {
      //$(document).ready(function () {
      logger.log('running in Browser', 'main');
      onDeviceReady(); //trigger onDeviceReady manually
      //});
    } //if (window.PhoneGap)

    function onDeviceReady() {
      if (window.PhoneGap) {
        //Cordova lifecycle events: http://cordova.apache.org/docs/en/2.5.0/cordova_events_events.md.html
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("online", onOnline, false);
        document.addEventListener("offline", onOffline, false);
      }

      //START
      durandal.start().then(function () {
        durandal.title = "MindForest";

        //configure toastr (see: http://codeseven.github.io/toastr/demo.html)
        toastr.options.positionClass = 'toast-bottom-right';
        toastr.options.backgroundpositionClass = 'toast-bottom-right';
        toastr.options.iconClasses = {
          error: 'alert alert-danger',
          info: 'alert alert-info',
          success: 'alert alert-success',
          warning: 'alert alert-warning'
          //error: 'label-important',
          //info: 'label-info',
          //success: 'label-success',
          //warning: 'label-warning'
        };

        router.handleInvalidRoute = function (route, params) {
          logger.logError('No Route Found', 'main', route);
        };

        //Look for viewmodels, views and partial views in the views folder
        viewLocator.useConvention('views', 'views', 'views');
        router.makeRelative({ moduleId: 'views' });

        // Adapt to touch devices
        //durandal.adaptToDevice();

        //Show the app by setting the root view model for our application.
        //choose shell depending on environment
        switch (platform.device.type) {
          case 'Phone':
            logger.log('starting Phone shell', 'main');
            durandal.setRoot('views/home', 'entrance'); //TODO: expected to set the default transition
            break;
            //case 'Tablet':
            //case 'PC':
          default:
            logger.log('starting default shell on device type: ' + platform.device.type, 'main');
            durandal.setRoot('views/_shell', 'entrance'); //TODO: expected to set the default transition
            break;
        } //switch (platform.device.type)

        app.initialize();

      }); //durandal.start().then
    } //_onDeviceReady

  }); //define


////Start
//$(function () {



