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
  }
};
