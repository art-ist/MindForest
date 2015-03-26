using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MindForest.Models {

	[Table("Connections", Schema = "Mind")]
	public partial class Connection {
		public Connection() {
			this.Texts = new HashSet<ConnectionText>();
		}

		public long Id { get; set; }
		public string CssClass { get; set; }
		public long FromId { get; set; }
		public long ToId { get; set; }
		public byte Relation { get; set; }
		public int Position { get; set; }
		public Nullable<bool> IsVisible { get; set; }
		public Nullable<bool> AlwaysExpand { get; set; }
		public string Style { get; set; }
		public string Color { get; set; }
		public string Width { get; set; }
		public string Hook { get; set; }
		public string ForeignId { get; set; }
		public string ForeignOrigin { get; set; }
		public System.DateTime CreatedAt { get; set; }
		public string CreatedBy { get; set; }
		public System.DateTime ModifiedAt { get; set; }
		public string ModifiedBy { get; set; }

		//[NotMapped] public int Level { get; set; }
		//[NotMapped] public bool HasChildren { get; set; }

		public virtual Node ToNode { get; set; }
		public virtual Node FromNode { get; set; }
		public virtual ICollection<ConnectionText> Texts { get; set; }
	}
}
