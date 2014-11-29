ko.bindingHandlers.select2 = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		var obj = valueAccessor(),
			allBindings = allBindingsAccessor(),
			lookupKey = allBindings.lookupKey;
		$(element).select2(obj);
		//if (lookupKey) {
		//	var value = ko.utils.unwrapObservable(allBindings.value);
		//	$(element).select2('data', ko.utils.arrayFirst(obj.data.results, function (item) {
		//		return item[lookupKey] === value;
		//	}));
		//}

		console.log('[übergabeparameter an select2 bindinghandler]', obj);
		//initialData = { id: 'hallo', text: 'ich bin ein test tag' };

		if (obj.dataStore) {
			obj.dataStore.subscribe(function (changes) {
				$(element).select2('data', obj.dataStore()); //{ id: 'hallo', text: 'ich bin ein test tag' }
			});
		}

		if (obj.initialData) {
			$(element).select2('data', obj.initialData); //{ id: 'hallo', text: 'ich bin ein test tag' }
		}

		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			$(element).select2('destroy');
		});
	},
	update: function (element) {
		$(element).trigger('change');
	}
};
