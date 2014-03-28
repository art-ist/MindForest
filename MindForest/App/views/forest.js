define([
  'services/logger',
  'services/app'
], function (logger, app) {

  var forestModel = {
    title: 'Forest',
    app: app,

    activate: function () {
      logger.log('View activated', forestModel.title);

      app.data.loadTrees();

      return true;
    },

    trees: app.data.trees,
    //currentTree: app.data.trees,
    //mapModel: new ko.observable({ currentNode: null }),

    openTree: app.openTree,
    logout: app.logout,

    setMapToOutline: function () { app.settings.map('outline'); },
    setMapToMM: function () { app.settings.map('mm'); },

  }; //forestModel (vm)

  return forestModel;
}); //define
