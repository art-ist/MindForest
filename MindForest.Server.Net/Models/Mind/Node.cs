using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MindForest.Models {

	[Table("Nodes", Schema="Mind")]
	public partial class Node {
		public Node() {
			this.IsTreeRoot = false;
			this.ConnectionsFrom = new HashSet<Connection>();
			this.ConnectionsTo = new HashSet<Connection>();
			this.Permissions = new HashSet<Permission>();
			this.Texts = new HashSet<NodeText>();
		}

		public long Id { get; set; }
		public string Lang { get; set; }
		public Nullable<int> UserId { get; set; }
		public string NodeType { get; set; }
		public bool IsTreeRoot { get; set; }
		public string Icon { get; set; }
		public string CssClass { get; set; }
		public string Style { get; set; }
		public string Color { get; set; }
		public string BackColor { get; set; }
		public string CloudColor { get; set; }
		public string FontName { get; set; }
		public string FontSize { get; set; }
		public string FontWeight { get; set; }
		public string FontStyle { get; set; }
		public Nullable<System.DateTime> ReminderAt { get; set; }
		public Nullable<byte> Progress { get; set; }
		public string Link { get; set; }
		public string MediaType { get; set; }
		public Nullable<decimal> MediaOffest { get; set; }
		public Nullable<decimal> MediaLength { get; set; }
		public Nullable<bool> MediaCycle { get; set; }
		public string Hook { get; set; }
		public string ForeignId { get; set; }
		public string ForeignOrigin { get; set; }
		public System.DateTime CreatedAt { get; set; }
		public string CreatedBy { get; set; }
		public System.DateTime ModifiedAt { get; set; }
		public string ModifiedBy { get; set; }
		public string MediaStreamId { get; set; }
		public Nullable<System.DateTime> LinkTestedAt { get; set; }
		public Nullable<short> LinkStatus { get; set; }
		public string TreeSettings { get; set; }
		public bool RestrictAccess { get; set; }

		public virtual ICollection<Connection> ConnectionsFrom { get; set; }
		public virtual ICollection<Connection> ConnectionsTo { get; set; }
		public virtual ICollection<Permission> Permissions { get; set; }
		public virtual ICollection<NodeText> Texts { get; set; }
	}
}
