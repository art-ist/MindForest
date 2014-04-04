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

    //readonly EFContextProvider<ForestEntities> _contextProvider =
    //new EFContextProvider<ForestEntities>();

    // ~/api/Mind/Metadata
    [HttpGet]
    public string Metadata() {
      var db = new MindContextProvider(null);
      return db.Metadata();
    }

    // ~/api/Mind/Trees
    // ~/api/Mind/Trees?$filter=IsArchived eq false&$orderby=CreatedAt
    [HttpGet]
    public IQueryable<Node> Trees(string Forest = null, string Lang = null) {
      var db = new MindContextProvider(Forest);
      //prepare parameters
      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";
      //get tree nodes
      return db.Context.GetTreeInfo(user, lang).AsQueryable();
      //Node[] result = db.Context.GetTreeInfo(user, lang).ToArray();
      ////calculate and attach MaxChildPosition
      //long[] ids = result.Select(n => n.Id).ToArray();
      //var maxChildPositions = db.Context.Connections
      //                          .Where(c => ids.Contains(c.FromId))
      //                          .GroupBy(c => c.FromId)
      //                          .Select(group => new { Id = group.Key, MaxPos = group.Max(c => c.Position) })
      //                          .ToDictionary(it => it.Id, it => it.MaxPos)
      //                          ;
      //foreach (var nd in result) {
      //  nd.MaxChildPosition = maxChildPositions.ContainsKey(nd.Id) ? maxChildPositions[nd.Id] : 0;
      //}   
      ////return result
      //return result.AsQueryable();
    }

    // ~/api/Mind/GetChildNodes
    [HttpGet]
    public IQueryable<ConnectionInfo> GetChildNodes(string Forest, int NodeId, string Lang, int? Levels) {
      var db = new MindContextProvider(Forest);
      ConnectionInfo[] result;

      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";
      result = db.Context.GetChildConnections(user, lang, NodeId, Levels)
                             .OrderBy(c => c.Position)
                             .ToArray()
                             ;
      long[] ids = result.Select(c => c.ToId.Value).ToArray();

      var nodes = db.Context.Nodes.Where(n => ids.Contains(n.Id)).ToArray();
      if (lang != "%") nodes = nodes.Where(n => n.Lang == lang || n.Lang == null).ToArray();

      //calculate and attach MaxChildPosition
      var maxChildPositions = db.Context.Connections
                                  .Where(c => ids.Contains(c.FromId))
                                  .GroupBy(c => c.FromId)
                                  .Select(group => new { Id = group.Key, MaxPos = group.Max(c => c.Position) })
                                  .ToDictionary(it => it.Id, it => it.MaxPos)
                                  ;
      foreach (var nd in nodes) {
        nd.MaxChildPosition = maxChildPositions.ContainsKey(nd.Id) ? maxChildPositions[nd.Id] : 0;
      }

      foreach (var conn in result) {
        conn.ToNode = nodes.Where(n => n.Id == conn.ToId).FirstOrDefault();
      }

      return result.AsQueryable();
    }

    // ~/api/Mind/GetNodeDetails
    [HttpGet]
    public IEnumerable<Node> GetNodeDetails(string Forest, string Lang, int NodeId) {
      var db = new MindContextProvider(Forest);
      //ToDo: Add SecurityClipping
      string user = User.Identity.IsAuthenticated ? User.Identity.Name : null;
      string lang = Lang ?? "%";
      return db.Context
               .GetNodeDetails(user, lang, NodeId)
               .AsQueryable();
    }

    [Authorize(Roles = "Admins, Owners, Authors")]
    [HttpGet]
    public IEnumerable<ParentsLookup> GetParentsLookup(string Forest, int TreeId, string Lang = "%") {
      string user = User.Identity.Name;
      var db = new MindContextProvider(Forest);

      return db.Context.GetParentsLookup(TreeId, user, Lang);
    }

    // ~/api/Mind/SaveChanges
    //[MembershipHttpAuthorize(Roles="Owners, Authors")]
    [Authorize(Roles = "Admins, Owners, Authors")]
    [HttpPost]
    public SaveResult SaveChanges(JObject saveBundle/*, string Forest*/) {
      var Forest = "Mutmacherei"; //ToDo: pass Forest from Client

      var db = new MindContextProvider(Forest);

      //ToDo: intercept updates: check permissions, if node deleted, which has other connctions, ignore delete of node (delete connection only)

      return db.SaveChanges(saveBundle);
    }

  }
}
