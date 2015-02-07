﻿define([
  'services/logger',
  'services/app',
  'services/mind',
  'plugins/router'
], function (logger, app, mind, router) {
	"use strict";

	var menu = {

		//Properties
		app: app,
		mind: mind,

		langs: app.langs,

		//methods
		setLang: setLang,
		setMap: setMap,
		setDetailsStyle: setDetailsStyle,

		activate: function () {
			logger.log('View activated', 'menu');
		}

	};

	//Fields
	var self = this;

	return menu;

	//Methods
	function setLang(data) {
		menu.app.lang(data.id);
	}

	function setMap(value) {
		menu.app.settings.map(value);
		//if (mind.currentTree()) {
		//	var tree = mind.currentTree().LTitle();
		//	router.navigate('#/' + tree + '/' + value);
		//}
	}

	function setDetailsStyle(value) {
		menu.app.settings.detailViewIndex(value);
		menu.app.showDetails();
	}

}); //define