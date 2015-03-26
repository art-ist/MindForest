using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MindForest.Models {

	[Table("NodeTexts", Schema = "Mind")]
	public partial class NodeText {
		public long Id { get; set; }
		public long NodeId { get; set; }
		public string Lang { get; set; }
		public int Position { get; set; }
		public string Title { get; set; }
		public string RichTitle { get; set; }
		public string Synopsis { get; set; }
		public string Description { get; set; }
		public string Comment { get; set; }

		public virtual Node Node { get; set; }
	}
}
