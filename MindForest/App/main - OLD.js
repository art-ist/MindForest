
  //#region configure sortable binding

  ////connect items with observableArrays
  //ko.bindingHandlers.sortableList = {
  //  init: function (element, valueAccessor, allBindingsAccessor, context) {
  //    $(element).data("sortList", valueAccessor()); //attach meta-data
  //    $(element).sortable({
  //      update: function (event, ui) {
  //        var item = ui.item.data("sortItem");
  //        if (item) {
  //          //identify parents
  //          var originalParent = ui.item.data("parentList");
  //          var newParent = ui.item.parent().data("sortList");
  //          //figure out its new position
  //          var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
  //          if (position >= 0) {
  //            originalParent.remove(item);
  //            newParent.splice(position, 0, item);
  //          }

  //          ui.item.remove();
  //        }
  //      },
  //      connectWith: '.container'
  //    });
  //  }
  //};

  ////attach meta-data
  //ko.bindingHandlers.sortableItem = {
  //  init: function (element, valueAccessor) {
  //    var options = valueAccessor();
  //    $(element).data("sortItem", options.item);
  //    $(element).data("parentList", options.parentList);
  //  }
  //};

  ////control visibility, give element focus, and select the contents (in order)
  //ko.bindingHandlers.visibleAndSelect = {
  //  update: function (element, valueAccessor) {
  //    ko.bindingHandlers.visible.update(element, valueAccessor);
  //    if (valueAccessor()) {
  //      setTimeout(function () {
  //        $(element).focus().select();
  //      }, 0); //new tasks are not in DOM yet
  //    }
  //  }
  //}

  //ko.bindingHandlers.sortable.afterMove = app.moveNode;

  //#endregion configure sortable binding

  //$(".colorpicker").pickAColor({
  //  showSpectrum: true,
  //  showSavedColors: true,
  //  saveColorsPerElement: true,
  //  fadeMenuToggle: true,
  //  showAdvanced: true,
  //  showBasicColors: false,
  //  showHexInput: true
  //});

  //set page height o window height
  function setPageHeight() {
    $("body")
      .css({ height: window.innerHeight })
    ;
  }
  setPageHeight();
  $(window).resize(function (event) {
    setPageHeight();
  });

  //ko.applyBindings(fm, document.getElementById("forestPage"));
  ko.applyBindings(app, document.getElementsByTagName('html')[0]);

  var localizeOptions = {
    pathPrefix: 'Content/languagepacks',
    fileExtension: 'json.txt'
  };
  var lang = $.requestParameters()['lang'];
  if (lang) {
    localizeOptions.language = lang;
  }
  $("[data-localize]")
    .localize("app", localizeOptions);


  //determine startpage
  var treeName = $.requestParameters()['tree'];
  var mapName = $.requestParameters()['map'];
  if ((typeof mapName) === 'string') {
    app.settings.map(mapName);
  }
  if (treeName) {
    //load trees
    app.data.loadTrees().then(function () {
      var trees = app.data.trees();
      for (var i = 0; i < trees.length; i++) {
        var tree = trees[i];
        if (tree.Title() === treeName) {
          app.data.currentTree(tree);
          app.openTree(tree);
        }
      }
    });
  }
  else {
    app.showForest('start');
  }


});