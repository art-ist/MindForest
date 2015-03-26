using System;

namespace MindForest.Models {

	public partial class NodeLookupInfo {
		public long Id { get; set; }
		public string Title { get; set; }
		public string CssClass { get; set; }
		public string Parent { get; set; }
		public string Lang { get; set; }
	}
}
