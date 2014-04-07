
using System.Collections.Generic;
namespace MindForest.Models {
  public class MindResult : ForestEntities {
    public IEnumerable<Connection> Connections { get; set; }
    public IEnumerable<Node> Nodes { get; set; }
  }
}