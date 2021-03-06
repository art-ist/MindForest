﻿define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {

	var vm = {
		//Properties
		app: app,

		//connection: app.mind.currentConnection,
		//node: app.mind.currentNode,

		searchString: ko.observable(''),
		searchResults: ko.observableArray([]),

		openDetail: openDetail,

		//Lifecycle Events
		canActivate: canActivate,
		//activate: activate,
		compositionComplete: compositionComplete

	};
	return vm;

	function canActivate() {
		return app.user.mayEdit();
	}

	//function activate() {
	//}

	function compositionComplete(view, parent) {
		//logger.log('Composition complete', 'dock', view);
		if (app.detailsVisible) {
			app.showDetails();
		}
		vm.searchString.subscribe(function (newValue) { triggerSearch(newValue); });
	}

	function triggerSearch (searchStr) {
		var manager = mind.manager;
		var query = new breeze.EntityQuery()
			.from('GetNodeLookup')
			.withParameters({ Lang: vm.app.lang, Forest: vm.app.forest, RootNodeId: vm.app.mind.currentTree().Id })
			.where('Title', 'contains', searchStr)
			.take(25)
		;
		manager.executeQuery(query)
			.then(function (data) {
				vm.searchResults(data.results); //observable overwritten but notifies UI to bind before it dies ;-)
				//console.log("[ search.js | searchString subscribtion ] data = ", data);
				//console.log("[ search.js | searchString subscribtion ] vm.searchResult = ", vm.searchResults);
			})
			.fail(function (e) {
				console.error("[ search.js | searchString subscribtion ] error: ", e);
			});
	}
	function openDetail(data, event) {

		var manager = vm.app.mind.manager; // TODO: serverside-search
		var query = new breeze.EntityQuery()
			.from('Test')
			.where('Id', 'eq', parseInt(data.Id))
		;
		manager.executeQuery(query)
			.then(function (data) {
				console.log("[ app | initialize ] node = ", data.results[0]);
				vm.app.mind.currentNode(data.results[0]);
				vm.app.showDetails();
			})
			.fail(function (e) {
				console.error("[ app | initialize ] error: ", e);
			});

	}
}); //define
