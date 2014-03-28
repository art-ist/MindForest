/* region Models */

function Node(d) {
  var self = this;

  self.Id = new ko.observable(d.Id);
  self.Lang = new ko.observable(d.Lang);
  self.UserId = new ko.observable(d.UserId);
  self.NodeType = new ko.observable(d.NodeType);
  self.IsTreeRoot = new ko.observable(d.IsTreeRoot);
  self.Title = new ko.observable(d.Title);
  self.RichTitle = new ko.observable(d.RichTitle);
  self.Content = new ko.observable(d.Content);
  self.Icon = new ko.observable(d.Icon);
  self.IconStreamId = new ko.observable(d.IconStreamId);
  self.Class = new ko.observable(d.Class);
  self.Style = new ko.observable(d.Style);
  self.Color = new ko.observable(d.Color);
  self.BackColor = new ko.observable(d.BackColor);
  self.CloudColor = new ko.observable(d.CloudColor);
  self.FontName = new ko.observable(d.FontName);
  self.FontSize = new ko.observable(d.FontSize);
  self.FontWeight = new ko.observable(d.FontWeight);
  self.FontStyle = new ko.observable(d.FontStyle);
  self.ReminderAt = new ko.observable(d.ReminderAt);
  self.Progress = new ko.observable(d.Progress);
  self.Link = new ko.observable(d.Link);
  self.DocumentStreamId = new ko.observable(d.DocumentStreamId);
  self.MediaType = new ko.observable(d.MediaType);
  self.MediaOffest = new ko.observable(d.MediaOffest);
  self.MediaLength = new ko.observable(d.MediaLength);
  self.MediaCycle = new ko.observable(d.MediaCycle);
  self.Hook = new ko.observable(d.Hook);
  self.ForeignId = new ko.observable(d.ForeignId);
  self.ForeignOrigin = new ko.observable(d.ForeignOrigin);
  self.CreatedAt = new ko.observable(d.CreatedAt);
  self.CreatedBy = new ko.observable(d.CreatedBy);
  self.ModifiedAt = new ko.observable(d.ModifiedAt);
  self.ModifiedBy = new ko.observable(d.ModifiedBy);

  self.Details = new ko.observableArray([]);
  self.ChildConnections = new ko.observableArray([]);

  self.toString = ko.computed(function() {
      return ko.toJSON(this.Details()).replace('{', '<br/>{');
    }, this);

  //this.ChildCount = new ko.observable(d.ChildCount);  //ToDo: computed
  //this.DescendentCount = new ko.observable(d.DescendentCount);  //ToDo: computed

  //this.Children = new ko.observableArray([]);

  //this.Expanded = new ko.observable(false);
  //this.ChildrenVisible = new ko.computed({
  //  read: function () { return (/*this.Children().length > 0 &&*/ this.Expanded); },
  //  owner: this
  //})

  //self.showWebPage = function (data, event) {
  //  alert('dataModel.showWebPage');
  //  $('#webPage').show('slide', { direction: 'right' }, animationDuration);
  //  return false;
  //}

} //Node

function Connection(d) {
  var self = this;
  self.ToId = new ko.observable(d.ToId);
  self.Position = new ko.observable(d.Position);
  self.IsVisible = new ko.observable(d.IsVisible);
  self.IsExpanded = new ko.observable(d.IsExpanded);
  self.Style = new ko.observable(d.Style);
  self.Color = new ko.observable(d.Color);
  self.Width = new ko.observable(d.Width);
  self.Hook = new ko.observable(d.Hook);
  self.ForeignId = new ko.observable(d.ForeignId);
  self.ForeignOrigin = new ko.observable(d.ForeignOrigin);
  self.CreatedAt = new ko.observable(d.CreatedAt);
  self.CreatedBy = new ko.observable(d.CreatedBy);
  self.ModifiedAt = new ko.observable(d.ModifiedAt);
  self.ModifiedBy = new ko.observable(d.ModifiedBy);

  self.HasChildren = new ko.observable(d.HasChildren);
  self.Level = new ko.observable(d.Level);
  self.ToNode = new ko.observable(new Node(d.ToNode));
  self.cIsExpanded = new ko.observable(d.IsExpanded);
} //Connection

/* endregion */