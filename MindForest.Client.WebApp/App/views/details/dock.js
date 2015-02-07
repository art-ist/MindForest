define([
  'services/logger',
  'services/app'
], function (logger, app) {

	var vm = {
		//Properties
		app: app,

		connection: app.mind.currentConnection,
		node: app.mind.currentNode,

		//Lifecycle Events
		compositionComplete: compositionComplete

	};
	return vm;

	function compositionComplete(view, parent) {
		//logger.log('Composition complete', 'dock', view);
		if (app.detailsVisible) {
			app.showDetails();
		}
	}

}); //define
