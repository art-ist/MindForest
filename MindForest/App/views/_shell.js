define([
  'plugins/router',
  'services/app'
], function (router, app) {

  var shell = {
    router: router,
    app: app,

    activate: onActivate,
    //,bind: onBind
  };
  return shell;

  //#region lifecycle events

  function onActivate() {
    var routes = [
        { route: ['', 'home', 'forest']				, moduleId: 'forest'	, title: ''             , nav: false }
      , { route: ['(:tree/)mm', '(:tree/)mindmap']	, moduleId: 'mm'		, title: 'MindMap'		, nav: false }
      , { route: '(:tree/)mmOld'					, moduleId: 'mmOld'		, title: 'MindMapOld'	, nav: false }
      , { route: ['(:tree/)outline']				, moduleId: 'outline'	, title: 'Outline'      , nav: false }

      //, { route: 'my/login'         , moduleId: 'my/login'         , title: 'Anmelden'      , nav: false }
      //, { route: 'my/registration'  , moduleId: 'my/registration'  , title: 'Registrieren'  , nav: false }
      //, { route: 'my/registrationExt',moduleId: 'my/registrationExt',title: 'Registrieren'  , nav: false }
      //, { route: 'my/profile'       , moduleId: 'my/profile'       , title: 'Profil'        , nav: false }

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



});