ko.bindingHandlers.nullableValue = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		var underlyingObservable = valueAccessor();
		var interceptor = ko.dependentObservable({
			read: underlyingObservable,
			write: function (value) {
				if (value == '') {
					underlyingObservable(null);
					return;
				}
				underlyingObservable(value);
			}
		});
		ko.bindingHandlers.value.init(element, function () { return interceptor; }, allBindingsAccessor);
	},
	update: ko.bindingHandlers.value.update
};