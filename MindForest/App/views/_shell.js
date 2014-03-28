define([
  'plugins/router',
  'services/app'
], function (router, app) {

  var shell = {
    router: router,
    app: app,

    activate: onActivate,
    //,bind: onBind

    login: login
  };
  return shell;

  //#region lifecycle events

  function onActivate() {
    var routes = [
        { route: ['', 'home', 'forest']       , moduleId: 'forest'             , title: ''              , nav: false }
      , { route: ['mm', 'mindmap']            , moduleId: 'mm'                 , title: 'MindMap'       , nav: false }
      , { route: 'outline'                    , moduleId: 'outline'            , title: 'Outline'       , nav: false }

      //, { route: 'my/login'         , moduleId: 'my/login'         , title: 'Anmelden'      , nav: false }
      //, { route: 'my/registration'  , moduleId: 'my/registration'  , title: 'Registrieren'  , nav: false }
      //, { route: 'my/registrationExt',moduleId: 'my/registrationExt',title: 'Registrieren'  , nav: false }
      //, { route: 'my/profile'       , moduleId: 'my/profile'       , title: 'Profil'        , nav: false }
      //, { route: 'my/shoppingList'  , moduleId: 'my/shoppingList'  , title: 'Einkaufsliste' , nav: false }
      //, { route: 'my/locations'     , moduleId: 'my/locations'     , title: 'Favoriten'     , nav: false }

      //, { route: 'about/privacy'    , moduleId: 'about/privacy'    , title: 'Privatsphäre'  , nav: false }
      //, { route: 'about/impress'    , moduleId: 'about/impress'    , title: 'Impressum'     , nav: false }
    ];
    router.map(routes);
    return router
      //.buildNavigationModel()
      .mapUnknownRoutes('forest', 'not-found') //TODO: create error message
      .activate('forest')
    ;
  }

  //function onBind() {
  //  //logger.log('map initialized', 'shell', $('#map').html())
  //}

  //#endregion lifecycle events

  function login() {
    app.login($('#login-name').val(), $('#login-pwd').val()); 
    $('#login').modal('hide'); 
  }

});