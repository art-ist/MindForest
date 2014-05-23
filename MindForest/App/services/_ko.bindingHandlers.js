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
		var options = valueAccessor();
		console.log("-----------------init------");
		console.log({ element: element, valueAccessor: valueAccessor(), allBindingsAccessor: allBindingsAccessor(), viewModel: viewModel, bindingContext: bindingContext });

		if (viewModel.isExpanded) {
			console.log("--> subscribing changes on c" + viewModel.Id());
			//subscribe expanding and collapsing nodes
			var subscription = viewModel.isExpanded.subscribe(function (newValue) {
				console.log("--> subscription called with value " + newValue);
				console.log({ newValue: newValue, element: element, valueAccessor: valueAccessor(), allBindingsAccessor: allBindingsAccessor(), viewModel: viewModel, bindingContext: bindingContext });
				ko.bindingHandlers.plumb.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
			}, bindingContext);

			//unsubscribe on dsposal
			ko.utils.domNodeDisposal.addDisposeCallback(element, function (p1, p2, p3, p4) {
				console.log("--> disposing subscription");
				console.log({ p1: p1, p2: p2, p3: p3, p4: p4});
				bindingContext.$root.plumb.repaintEverything();
				subscription.dispose();
			});
		} //if (viewModel.isExpanded)
		console.log("----------------!init------");
	}, //init
	update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		console.log("-----------------update------");
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
				console.log('creating line:  ' + from + ' ---> ' + to + ' | on ' + container);
				connections[i].line = plumb.connect({
					source: from,
					target: to,
					container: container,
					overlays: [
						["Label", { label: con.Id() + '', id: "line-" + con.Id() }]
					]
				});
				//plumb.draggable(to);
			} //for
		} //if (connections.length)

		plumb.repaintEverything();

	} //update
}; //ko.bindingHandlers.plumbSortable