define([
  'plugins/router',
  'services/app'
], function (router, app) {

	var shell = {
		router: router,
		app: app,

		activate: onActivate

	};
	return shell;

	//#region lifecycle events

	function onActivate() {
		var routes = [
			{ moduleId: 'forest', route: ['', '(:forest)', '(:forest/)', '(:forest/)home', '(:forest/)forest'], title: '', nav: false }

		  , { moduleId: 'maps/mindmap', route: ['(:forest/)(:tree/)mindmap', '(:forest/)(:tree/)mm', '(:forest/)(:tree/)mm/(:id)'], title: 'Mind Map', nav: false }
		  , { moduleId: 'maps/mmOld'	, route: ['(:forest/)(:tree/)mmOld'], title: 'Mind Map (Old)', nav: false }
		  , { moduleId: 'maps/outline'	, route: ['(:forest/)(:tree/)outline'], title: 'Outline', nav: false }

		  //, { moduleId: 'my/login'         , route: 'my/login'         , title: 'Anmelden'      , nav: false }
		  //, { moduleId: 'my/registration'  , route: 'my/registration'  , title: 'Registrieren'  , nav: false }
		  //, { moduleId: 'my/registrationExt',route: 'my/registrationExt',title: 'Registrieren'  , nav: false }
		  //, { moduleId: 'my/profile'       , route: 'my/profile'       , title: 'Profil'        , nav: false }

		  //, { moduleId: 'about/privacy'    , route: 'about/privacy'    , title: 'Privatsphäre'  , nav: false }
		  //, { moduleId: 'about/impress'    , route: 'about/impress'    , title: 'Impressum'     , nav: false }
		];
		router.map(routes);
		return router
		  //.buildNavigationModel()
		  .mapUnknownRoutes('forest', 'not-found') //TODO: create error message
		  .activate('forest')
		;
	}

	//#endregion lifecycle events



});