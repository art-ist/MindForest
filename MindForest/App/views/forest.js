define([
  'services/logger',
  'services/app',
  'services/mind'
], function (logger, app, mind) {

  var forestModel = {
    title: 'Forest',
    app: app,

    activate: function () {
      logger.log('View activated', forestModel.title);

      if (mind.trees().length === 0) {
        mind
          .loadTrees()
          .then(function () { logger.log('Trees received', 'Forest - activate', mind.trees()); })
          ;
      }

      return true;
    },

    trees: mind.trees,

    openTree: app.openTree,
    logout: app.logout,

    setMapToOutline: function () { app.settings.map('outline'); },
    setMapToMM: function () { app.settings.map('mm'); },

  }; //forestModel (vm)

  return forestModel;
}); //define
