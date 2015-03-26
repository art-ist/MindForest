using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MindForest.Models {

	[Table("ConnectionTexts", Schema = "Mind")]
	public partial class ConnectionText {
		public long Id { get; set; }
		public long ConnectionId { get; set; }
		public string Lang { get; set; }
		public string StartText { get; set; }
		public string LineText { get; set; }
		public string EndText { get; set; }
		public string Description { get; set; }
		public string Comment { get; set; }

		public virtual Connection Connection { get; set; }
	}
}
