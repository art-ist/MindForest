using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MindForest.Models {

  public partial class Connection {

    //public int Level { get; set; }
    //public bool HasChildren { get; set; }
    //public bool Expand { get; set; }

    //public Node Node { get; set; }

  }

  public partial class ConnectionInfo {

    public Node ToNode { get; set; }

  } 

} //ns