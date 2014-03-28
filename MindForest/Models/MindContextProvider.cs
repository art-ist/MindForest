using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using System.Diagnostics;
using Breeze.ContextProvider.EF6;
using Breeze.ContextProvider;
using MindForest.Models;

namespace MindForest.Models {
  public class MindContextProvider : EFContextProvider<ForestEntities> {

    static TraceSwitch trace = new TraceSwitch("Data", "Data API");

    public MindContextProvider(string Forest)
      : base() {
      if (string.IsNullOrEmpty(Forest)) {
        Forest = ConfigurationManager.AppSettings["DefaultForest"];
      }
      this.Context.Database.Connection.ConnectionString = ConfigurationManager.ConnectionStrings[Forest + "Db"].ConnectionString;
      this.Context.Configuration.LazyLoadingEnabled = false;
    }

    protected override Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap) {
      var db = this.Context;

      if (saveMap.ContainsKey(typeof(Node))) {
        //create IDs for new Nodes
        long maxId = db.Nodes.Max(n => n.Id);
        foreach (Node nd in saveMap[typeof(Node)]
                            .Where(info => info.EntityState == EntityState.Added && ((Node)info.Entity).Id < 0)
                            .Select(info => (Node)info.Entity)
                            ) {
          nd.Id = maxId + (Math.Abs(nd.Id));
        }

        if (saveMap.ContainsKey(typeof(Connection))) {
          foreach (Connection c in saveMap[typeof(Connection)]
                                   .Where(info => ((Connection)info.Entity).ToId < 0 || ((Connection)info.Entity).FromId < 0)
                                   .Select(info => (Connection)info.Entity)
                                   ) {
            if (c.FromId < 0) c.FromId = maxId + Math.Abs(c.FromId);
            if (c.ToId < 0) c.ToId = maxId + Math.Abs(c.ToId);
          }
        }

        ////do not actually delete Nodes, that have Connections which are not deleted as well
        //IEnumerable<Connection> connectionsToBeDeleted = new List<Connection>();
        //List<Connection> connectionsToConsider = new List<Connection>();
        //var nodesIdsToBeDeleted = saveMap[typeof(Node)]
        //                         .Where(info => info.EntityState == EntityState.Deleted)
        //                         .Select(info => ((Node)info.Entity).Id)
        //                         .ToArray()
        //                         ;
        //if (saveMap.ContainsKey(typeof(Connection))) {
        //  connectionsToBeDeleted = saveMap[typeof(Connection)]
        //                          .Where(info => info.EntityState == EntityState.Deleted)
        //                          .Select(info => (Connection)info.Entity)
        //                          ;
        //}
        //connectionsToConsider = db.Connections
        //                       .Where(c => nodesIdsToBeDeleted.Contains(c.ToId))
        //                       .ToList()
        //                       ;
        //foreach (var c in connectionsToConsider) {
        //  if (connectionsToBeDeleted.Where(it => it.FromId == c.FromId && it.ToId == c.ToId).FirstOrDefault() == null) {
        //    connectionsToConsider.Remove(c);
        //  }
        //}
        //var toIdsToConsider = connectionsToConsider.Select(it => it.ToId).ToArray();
        //foreach (var info in saveMap[typeof(Node)].Where(info => info.EntityState == EntityState.Deleted).ToArray()) {
        //  var nd = (Node)info.Entity;
        //  if (toIdsToConsider.Contains(nd.Id)) { // remaining Connection found
        //    Trace.WriteLineIf(trace.TraceVerbose, string.Format("Discarding deletion of Node {0} ({1}), aditional connections detected.", nd.Id, nd.Title), "SaveChanges");
        //    saveMap[typeof(Node)].Remove(info); //remove Node from delete-Lsit 
        //  }
        //}
      }

      //Log Changes - TODO: only it tracemode verbouse
      if (trace.TraceVerbose) traceSaveMap(saveMap);

      //return entities to be saved
      return base.BeforeSaveEntities(saveMap);
    } //if Nodes are in the saveMap

    private static void traceSaveMap(Dictionary<Type, List<EntityInfo>> saveMap) {
      foreach (var type in saveMap) {
        foreach (var item in type.Value) {
          string desc = "";
          switch (type.Key.Name) {
            case "Node":
              var n = (Node)item.Entity;
              desc = string.Format("[ Id = {0}, Title={1} ]", n.Id, n.Title);
              break;
            case "Connection":
              var c = (Connection)item.Entity;
              desc = string.Format("[ FromId = {0}, ToId = {1}, Position = {2} ]", c.FromId, c.ToId, c.Position);
              break;
            default:
              break;
          }
          Trace.WriteLine(string.Format("Saving {0} of {1} {2}.",
                          item.EntityState.ToString(),
                          type.Key.Name,
                          desc
                          ), "SaveChanges");
        } //foreach
      } //foreach
    }



    //ToDo: Implement iDisposable?
  }
}