//#region Binding Providers

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

//#endregion Binding Providers




//#region App specific ko.bindingHandlers

//databound connection lines used in mm
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
							ko.bindingHandlers.plumb.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);							//setTimeout(this.$root.plumb.repaintEverything(),2000); // Alternative ^^
                    		this.$root.plumb.repaintEverything();
                    	} catch (e) {
                    		console.warn("[plumb-binding] Catch von subscription !!! -- " + e.message);
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
                    		console.warn("[plumb-binding] Catch von disposing !!! -- " + err.message);
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
            //console.log("end-------------!init------");

        }
        catch (err) {
            console.warn("[plumb-binding] Catch von init !!! -- " + err.message);
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
                var container = options.containerId || 'container-c' + connections[0].Id();
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
                plumb.repaintEverything(); // TODO: optimize performenc

                // SET TIME OUT //
                //setTimeout(function () { plumb.repaintEverything(); }, 500);
                // not nessesery: delayed bindingHandler in mein.js
            }
            catch (err) { //hier taucht der "o is undefined" Error auf.
                console.warn("[plumb-binding] Catch von plumb.repaintEverything() in update -- " + err.message);
            }

        }
        catch (err) {
            console.warn("[plumb-binding] Catch von update !!! -- " + err.message);
        } // Dieser sollte das Error Problem mit "o not defined" forübergängig lösen (hat den fehler antscheinend egchatscht^^)

	} //update
}; //ko.bindingHandlers.plumbSortable

//#endregion App specific ko.bindingHandlers


