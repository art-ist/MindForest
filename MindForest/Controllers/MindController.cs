using System.Linq;
using System.Web.Http;
using System.Collections.Generic;

using Breeze.WebApi2;
using Breeze.ContextProvider.EF6;
using Breeze.ContextProvider;
using Newtonsoft.Json.Linq;
using MindForest.Models;
using System.Web.Http.Cors;

namespace MindForest.Controllers {

  [EnableCors("*", "*", "*")]
  [BreezeController]
  public class MindController : ApiController {

    // ~/api/Mind/Metadata
    /// <summary>
    /// Get schema information for breeze client.
    /// </summary>
    /// <param name="Forest">Name of the Forest (database) to use. If omitted DefaultForest is used. (The parameter will usually be passed through routing.)</param>
    /// <returns></returns>
    /// <example>
    /// ~/api/Mind/Metadata
    /// ~/api/Mutmacherei/Mind/Metadata
    /// </example>
    [HttpGet]
    public string Metadata(string Forest = null) {
      var db = new MindContextProvider(Forest);
      return db.Metadata();
    }

    /// <summary>
    /// All Nodes, that (including their first level childrn and details) represent a Tree. 
    /// </summary>
    /// <param name="Forest">Name of the Forest (database) to use. If omitted DefaultForest is used.</param>
    /// <param name="Lang">Two letter language code. If omitted all languages.</param>
    /// <returns>Nodes</returns>
    /// <example>
    /// ~/api/Mind/GetTrees
    /// ~/api/Mutmacherei/Mind/GetTrees?Lang=de
    /// ~/api/Mind/GetTrees?Forest=Mutmacherei&Lang=de
    /// ~/api/Mind/GetTrees?$filter=IsArchived eq false&$orderby=CreatedAt
    /// </example>
    [HttpGet]
    public dynamic GetTrees(string Forest = null, string Lang = null) {
      var db = new MindContextProvider(Forest);
      var trees = new MindResult();

      //prepare parameters
      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";

      //get the tree connections
      trees.Connections = db.Context
        //.GetChildConnections(null, user, 5, 0, lang)
        .GetChildConnections(null, user, 2, 0, lang)
        .ToArray();

      //get tree nodes
      List<long> ids = trees.Connections.Select(c => c.FromId)
                             .Distinct().ToList();
      ids.AddRange(trees.Connections.Select(c => c.ToId));
      trees.Nodes = db.Context.Nodes
          .Include("Permissions")
          .Include("Texts")
          .Where(n => ids.Contains(n.Id))
          .ToArray();

			//get forest settings //TODO: implement in db
			var settings = new KeyValuePair<string, string>[] {
				new KeyValuePair<string, string>( "NodeClasses" , ""),
				new KeyValuePair<string, string>( "ConnectionClasses" , ""),
				new KeyValuePair<string, string>( "Css" , "")
			};

			return new { trees = trees, settings = settings };
    }

    /// <summary>
    /// All child Connections and Nodes. 
    /// </summary>
    /// <param name="Forest">Name of the Forest (database) to use (If omitted the Forest is determined by the Url or DefaultForest is used)</param>
    /// <param name="NodeId">Id of the Node from which to start the tree search (if omitted start at the root)</param>
    /// <param name="Levels">Distance from the starting Node. (e.g. 1...children only, 2...include grandchildren)</param>
    /// <param name="SkipLevels">How many levels to skip from result (e.g. 1 start with grandchildren)</param>
    /// <param name="Lang">Two letter language code (if omitted all languages)</param>
    /// <returns>Connections</returns>
    [HttpGet]
    public dynamic GetChildren(string Forest, int? NodeId = null, int Levels = 1, int SkipLevels = 0, string Lang = null) {
      var db = new MindContextProvider(Forest);
      //prepare parameters
      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";
      //get the connections
      var connections = db.Context
        .GetChildConnections(NodeId, user, Levels, SkipLevels, lang)
        .ToArray();
      //get nodes
      var ids = connections.Select(c => c.ToId).ToArray();
      return new MindResult() { 
        Connections = connections,
        Nodes = db.Context.Nodes
          .Include("Permissions")
          .Include("Texts")
          .Where(n => ids.Contains(n.Id))
          .ToArray()
      };
    }

    /// <summary>
    /// All parent Connections and Nodes. 
    /// </summary>
    /// <param name="Forest">Name of the Forest (database) to use (If omitted the Forest is determined by the Url or DefaultForest is used)</param>
    /// <param name="NodeId">Id of the Node from which to start the tree search.</param>
    /// <param name="Levels">Distance from the starting Node. (e.g. 1...parents only, 2...include grandparents)</param>
    /// <param name="SkipLevels">How many levels to skip from result (e.g. 1 start with grandparents)</param>
    /// <param name="Lang">Two letter language code (if omitted all languages)</param>
    /// <returns>Connections</returns>
    [HttpGet]
    public dynamic GetParents(string Forest, int NodeId, int Levels = 1, int SkipLevels = 0, string Lang = null) {
      var db = new MindContextProvider(Forest);
      //prepare parameters
      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";
      //get the connections
      var connections = db.Context
        .GetParentConnections(NodeId, user, Levels, SkipLevels, lang)
        .ToArray();
      //get nodes
      var ids = connections.Select(c => c.FromId).ToArray();
      return new MindResult() {
        Connections = connections,
        Nodes = db.Context.Nodes
          .Include("Permissions")
          .Include("Texts")
          .Where(n => ids.Contains(n.Id))
          .ToArray()
      };
    }

    /// <summary>
    /// All neighbouring Connections (children and parents) and Nodes. 
    /// </summary>
    /// <param name="Forest">Name of the Forest (database) to use (If omitted the Forest is determined by the Url or DefaultForest is used)</param>
    /// <param name="NodeId">Id of the Node from which to start the network traversal (if omitted start at the root)</param>
    /// <param name="Levels">Distance from the starting Node. (e.g. 1...directly connected, 2...one intermediate Node)</param>
    /// <param name="SkipLevels">How many levels to skip from result (e.g. 1 will omit directly related items)</param>
    /// <param name="Lang">Two letter language code. If omitted all languages</param>
    /// <returns>Connections</returns>
    [HttpGet]
    public dynamic GetNeighbours(string Forest, int? NodeId = null, int Levels = 1, int SkipLevels = 0, string Lang = null) {
      var db = new MindContextProvider(Forest);
      //prepare parameters
      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";
      //get the connections
      var connections = db.Context
        .GetChildConnections(NodeId, user, Levels, SkipLevels, lang)
        .ToList();
      var ids = connections.Select(c => c.ToId).ToList();
      var parents = db.Context
        .GetParentConnections(NodeId, user, Levels, SkipLevels, lang)
        .ToArray();
      ids.AddRange(parents.Select(c => c.FromId).ToList());
      connections.AddRange(parents);
      //get nodes
      return new MindResult() {
        Connections = connections,
        Nodes = db.Context.Nodes
          .Include("Permissions")
          .Include("Texts")
          .Where(n => ids.Contains(n.Id))
          .ToArray()
      };
    }

		///// <summary>
		///// Lookup security roles to set permissons 
		///// </summary>
		///// <returns>Roles</returns>
		//[Authorize]
		//[HttpGet]
		//public dynamic Roles(string Forest) {
		//	var db = new MindContextProvider(Forest);
		//	return db.Context.Roles;
		//}


    //[MembershipHttpAuthorize(Roles="Owners, Authors")]
    /// <summary>
    /// Save Chenges to Forest (Database)
    /// </summary>
    /// <param name="saveBundle"></param>
    /// <returns>SaveBundle with updated entities</returns>    
    [Authorize(Roles = "Admin, Author")]
    [HttpPost]
    public SaveResult SaveChanges(string Forest, JObject saveBundle) {
      var db = new MindContextProvider(Forest);

      //TODO: intercept updates: check permissions, if node deleted, which has other connctions, ignore delete of node (delete connection only)

      return db.SaveChanges(saveBundle);
    }

  }
}
