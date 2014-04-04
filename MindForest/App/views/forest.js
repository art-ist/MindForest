define([
  'services/logger',
  'services/app'
], function (logger, app, data) {

  var forestModel = {
    title: 'Forest',
    app: app,

    activate: function () {
      logger.log('View activated', forestModel.title);

      if (app.data.trees().length === 0) {
        app.data
          .loadTrees()
          //.then(function () { logger.log('Treees received', 'Forest - activate', app.data.trees()); })
          ;
      }

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
