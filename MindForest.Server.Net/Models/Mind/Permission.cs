using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MindForest.Models {

	[Table("Permissions", Schema = "Mind")]
	public partial class Permission {
		public long NodeId { get; set; }
		public string RoleId { get; set; }
		public byte PermissionType { get; set; }

		public virtual Node Node { get; set; }
		public virtual Role Role { get; set; }
	}
}
