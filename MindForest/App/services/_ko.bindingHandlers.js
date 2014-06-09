
(function () {

	//Catch binding exceptions using a custom binding provider
	//see: http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html
	var existing = ko.bindingProvider.instance;

	ko.bindingProvider.instance = {
		nodeHasBindings: existing.nodeHasBindings,
		getBindings: function(node, bindingContext) {
			var bindings;
			try {
				bindings = existing.getBindings(node, bindingContext);
			}
			catch (ex) {
				if (window.console && console.log) {
					console.log("KO binding error: " + ex.message, node, bindingContext);
				}
			}
			return bindings;
		}
	};

})();



ko.bindingHandlers.fadeVisible = {
	init: function (element, valueAccessor) {
		// Initially set the element to be instantly visible/hidden depending on the value
		var value = valueAccessor();
		$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
	},
	update: function (element, valueAccessor) {
		// Whenever the value subsequently changes, slowly fade the element in or out
		var value = valueAccessor();
		ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
	}
};

//class binding (like css binding but gets the classname from binding)
ko.bindingHandlers.class = {
	update: function (element, valueAccessor) {
		if (element['__ko__previousClassValue__']) {
			$(element).removeClass(element['__ko__previousClassValue__']);
		}
		var value = ko.utils.unwrapObservable(valueAccessor());
		$(element).addClass(value);
		element['__ko__previousClassValue__'] = value;
		//var values = ko.utils
		//	.unwrapObservable(valueAccessor())
		//	.replace(/[,;\s]/g, ' ') //replace , or multiple whitespaces with single blanc
		//	.replace(/^\s+|\s+$/, ' ')	//trim (remove leading or trailing blanks)
		//	.split(' ');
		//for (var i = 0; i < length; i++) {
		//	$(element).addClass(values[i]);
		//}
		//element['__ko__previousClassValue__'] = value; //TODO: coange to values
	}
};

//class binding (like css binding but gets the classname from binding)
ko.bindingHandlers.plumb = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        try {

            var options = valueAccessor();
            //console.log("Begin------------init------");
            //console.log({ element: element, valueAccessor: valueAccessor(), allBindingsAccessor: allBindingsAccessor(), viewModel: viewModel, bindingContext: bindingContext });

            if (viewModel.Id() === 1 && !viewModel.isExpanded) {
                //console.log("--> if(viewModel.Id() == 1 && !viewModel.isExpanded) = TRUE , viewModel = ");
                //console.log({ viewModel: viewModel });

                for(var i = 0; i < viewModel.ConnectionsTo().length; i++) {
                    var c = viewModel.ConnectionsTo()[i];

                    //console.log("--> subscribing changes on c" + c.Id());

                    var subscription = c.isExpanded.subscribe(function (newValue) {
                        //console.log("--> subscription calles c" + c.Id() + " with value " + newValue);
                        ko.bindingHandlers.plumb.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                        //this.$root.plumb.repaintEverything(); // Alternative ^^
                    }, bindingContext);
                }
            }

            if (viewModel.isExpanded) { // because root node has no such property
                //    var c = viewModel;
                for (var i = 0; i < viewModel.ChildConnections().length; i++) {

                    var c = viewModel.ChildConnections()[i];

                    //console.log("--> subscribing changes on c" + c.Id());
                    //subscribe expanding and collapsing nodes
                    var subscription = c.isExpanded.subscribe(function (newValue) {
                    	try {
							//console.log("--> subscription called c" + c.Id() + " with value " + newValue);
							//console.log({ newValue: newValue, element: element, valueAccessor: valueAccessor(), allBindingsAccessor: allBindingsAccessor(), viewModel: viewModel, bindingContext: bindingContext });
							ko.bindingHandlers.plumb.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
							//setTimeout(this.$root.plumb.repaintEverything(),2000); // Alternative ^^
                    		//this.$root.plumb.repaintEverything();
                    	} catch (e) {
                    		console.log("ERROR Catch von subscription !!! -- " + e.message);
                    	}

                    }, bindingContext);

                    //unsubscribe on dsposal
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function (p1, p2, p3, p4) {
                    	try {
							//console.log("--> disposing subscription");
							//console.log({ p1: p1, p2: p2, p3: p3, p4: p4});
							//bindingContext.$root.plumb.repaintEverything();
							subscription.dispose();
                    	} catch (e) {
                    		console.log("ERROR Catch von disposing !!! -- " + err.message);
                    	}

                    });
                } // end for (viewModel.ChildConnections)
            } // end if (viewModel.isExpanded)

            /* Bestimen der Pos eines Divs
            // Findet die absolute x Position eines Elementes raus
            function getAbsoluteX (elm) {
               var x = 0;
               if (elm && typeof elm.offsetParent != "undefined") {
                 while (elm && typeof elm.offsetLeft == "number") {
                   x += elm.offsetLeft;
                   elm = elm.offsetParent;
                 }
               }
               return x;
            }
    
    
            // Findet die absolute y Position eines Elementes raus
            function getAbsoluteY(elm){
               var y = 0;
               if (elm && typeof elm.offsetParent != "undefined") {
                 while (elm && typeof elm.offsetTop == "number") {
                   y += elm.offsetTop;
                   elm = elm.offsetParent;
                 }
               }
               return y;
            }
    
            // anwenden der Funktionen
            var elm = document.getElementById("divid");
            var x = getAbsoluteX(elm);
             */
            console.log("end-------------!init------");

        }
        catch (err) {
            console.log("ERROR Catch von init !!! -- " + err.message);
        }

	}, //init
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        try {

            //console.log("-----------------update------");
            var options = ko.utils.unwrapObservable(valueAccessor());
            //var plumb = $.data(element, 'plumb');
            var plumb = bindingContext.$root.plumb;
            var connections = options.data();

            //jsPlumb.doWhileSuspended(function () {

            //plumb.removeAll();
            if (connections.length) {
                var from = options.fromId || 'node-' + connections[0].FromId();
                var container = options.containerId || 'container-c' + connections[0].FromId();
                for (var i = 0; i < connections.length; i++) {
                    var con = connections[i];
                    var to = options.toId || 'node-' + con.ToId();
                    //console.log('creating line:  ' + from + ' ---> ' + to + ' | on ' + container);
                    connections[i].line = plumb.connect({
                        source: from,
                        target: to,
                        container: container
                        //,overlays: [
                        //    ["Label", { label: con.Id() + '', id: "line-" + con.Id() }]
                        //]
                    });
                    //plumb.draggable(to);
                } //for
            } //if (connections.length)
            
            try {
                //plumb.repaintEverything();
                setTimeout(function () { plumb.repaintEverything(); }, 500);
                /*  1.) Mit dem setTimeout wurde das Aktualisierungsproblem der Linien sowie die Linien beim erstmaligen öffnen des Baums gelöst 
                 *      (ist nur leider noch keine entgültige Lösung da mit dem TimeOut von 500ms die Visualisierung nicht sehr flüssig läuft).
                 *  2.) Die 500ms als TiemOut sind leider auch nicht stark zu reduzieren, da die Fehler bei geringerer Wartezeit zurückkehren.
                 *  4.) TypeError: "o is Undefined" tritt erst beim Schliesen von Knoten auf, da durch das knockout Binding die Div mit den Linien
                 *      gelöscht werden und das Plumb nicht mitbekommt das diese nicht mehr vorhanden sind. Jedoch beim Aktualisieren alle (auch
                 *      die nicht mehr vorhandenen Linien) aktualisieren möchte. (o ist in diesem falle ein Objekt welches in der internen 
                 *      Datenstrucktur vom Plump die Linien Symbolisiert und nach den Lageparametern gefragt wird, welche nicht mehr definiert sind
                 *      nachdem Löschen der Linien innerhalb der geschlossenen Div).
                 */
            }
            catch (err) { //hier taucht der "o is undefined" Error auf.
                console.log("ERROR Catch von plumb.repaintEverything() in update -- " + err.message);
            }

        }
        catch (err) {
            console.log("ERROR Catch von update !!! -- " + err.message);
        } // Dieser sollte das Error Problem mit "o not defined" forübergängig lösen (hat den fehler antscheinend egchatscht^^)

	} //update
}; //ko.bindingHandlers.plumbSortable