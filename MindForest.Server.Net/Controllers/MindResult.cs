using System.Collections.Generic;

namespace MindForest.Models {
  public class MindResult {
    public IEnumerable<Connection> Connections { get; set; }
    public IEnumerable<Node> Nodes { get; set; }
  }
}