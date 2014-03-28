/// <reference path="../jquery-1.9.0.js" />
/// <reference path="../jquery-ui-1.10.0.js" />
/// <reference path="../app.js" />

function forestModel() {
  /* Data */
  var self = this;
  self.trees = new ko.observableArray([]);
  self.currentNode = new ko.observable();

  self.mapModel = new ko.observable({currentNode: null});

  /* Behavours */
  var pars = $.requestParameters();
  var lang = pars['lang'] ? 'Lang=' + pars['lang'] : 'Lang=%';
  var forest = pars['forest'] ? '&Forest='+pars['forest'] : '';
  self.loadTrees = function () {
    $.ajax({
      type: "GET",
      url: "/MindForestService.svc/GetTrees?" + lang + forest,
      //contentType: "application/json",
      //dataType: "json",
      success: function (result) {
        var data = result.d;
        //trees
        if (data == "") {
          self.trees([]); //ggf. vorhandene Trees löschen
          return;
        }
        self.trees([]);
        for (var i = 0; i < data.length; i++) {
          self.trees.push(new Node(data[i]));
        }
      },
      error: function (errMsg) {
        alert(errMsg.responseText);
      }
    }); //ajax
  } //loadTrees

  self.loadRootNodes = function (data, event) {
    self.currentNode(data);

    tm = new treeModel();
    self.mapModel(tm);
    tm.title = data.Title;
    //tm.currentNode(data);
    tm.loadNodes(data.Id(), tm.connections);

    app.hideForest();
    $('#mapPage')
      .show()
      .load('tree.html', function() {
        //.removeClass('outRight').addClass('full');
        $.scrollTo('#mapPage', '500');

        ko.applyBindings(tm, document.getElementById("mapPage"));
      })
      ;

  }; //loadRootNodes


} //treeModel

/* endregion */
