using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web;

namespace MindForest.Models {
	public class MindDbContext : DbContext {

	  public MindDbContext()
            : base("name=MindDbContext")
        {
    		        this.Configuration.LazyLoadingEnabled = false;
        }
	  public MindDbContext(string ConnectionName)
            : base("name=" + ConnectionName)
        {
            this.Configuration.LazyLoadingEnabled = false;
        }

    
        public DbSet<Node> Nodes { get; set; }
        public DbSet<Connection> Connections { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<NodeText> NodeTexts { get; set; }
        public DbSet<ConnectionText> ConnectionTexts { get; set; }
        public DbSet<UserClaim> UserClaims { get; set; }
        public DbSet<UserExternalLogin> UserExternalLogins { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
    
        public virtual IQueryable<Connection> GetNeighbourConnections(Nullable<int> nodeId, string user, Nullable<int> levels, Nullable<int> skipLevels, string lang)
        {
            var nodeIdParameter = nodeId.HasValue ?
                new ObjectParameter("NodeId", nodeId) :
                new ObjectParameter("NodeId", typeof(int));
    
            var userParameter = user != null ?
                new ObjectParameter("User", user) :
                new ObjectParameter("User", typeof(string));
    
            var levelsParameter = levels.HasValue ?
                new ObjectParameter("Levels", levels) :
                new ObjectParameter("Levels", typeof(int));
    
            var skipLevelsParameter = skipLevels.HasValue ?
                new ObjectParameter("SkipLevels", skipLevels) :
                new ObjectParameter("SkipLevels", typeof(int));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<Connection>("[MindDbContext].[GetNeighbourConnections](@NodeId, @User, @Levels, @SkipLevels, @Lang)", nodeIdParameter, userParameter, levelsParameter, skipLevelsParameter, langParameter);
        }
    
        public virtual IQueryable<Connection> GetChildConnections(Nullable<int> nodeId, string user, Nullable<int> levels, Nullable<int> skipLevels, string lang)
        {
            var nodeIdParameter = nodeId.HasValue ?
                new ObjectParameter("NodeId", nodeId) :
                new ObjectParameter("NodeId", typeof(int));
    
            var userParameter = user != null ?
                new ObjectParameter("User", user) :
                new ObjectParameter("User", typeof(string));
    
            var levelsParameter = levels.HasValue ?
                new ObjectParameter("Levels", levels) :
                new ObjectParameter("Levels", typeof(int));
    
            var skipLevelsParameter = skipLevels.HasValue ?
                new ObjectParameter("SkipLevels", skipLevels) :
                new ObjectParameter("SkipLevels", typeof(int));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<Connection>("[MindDbContext].[GetChildConnections](@NodeId, @User, @Levels, @SkipLevels, @Lang)", nodeIdParameter, userParameter, levelsParameter, skipLevelsParameter, langParameter);
        }
    
        public virtual IQueryable<Connection> GetParentConnections(Nullable<int> nodeId, string user, Nullable<int> levels, Nullable<int> skipLevels, string lang)
        {
            var nodeIdParameter = nodeId.HasValue ?
                new ObjectParameter("NodeId", nodeId) :
                new ObjectParameter("NodeId", typeof(int));
    
            var userParameter = user != null ?
                new ObjectParameter("User", user) :
                new ObjectParameter("User", typeof(string));
    
            var levelsParameter = levels.HasValue ?
                new ObjectParameter("Levels", levels) :
                new ObjectParameter("Levels", typeof(int));
    
            var skipLevelsParameter = skipLevels.HasValue ?
                new ObjectParameter("SkipLevels", skipLevels) :
                new ObjectParameter("SkipLevels", typeof(int));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<Connection>("[MindDbContext].[GetParentConnections](@NodeId, @User, @Levels, @SkipLevels, @Lang)", nodeIdParameter, userParameter, levelsParameter, skipLevelsParameter, langParameter);
        }
    
        public virtual IQueryable<Node> GetNodes(string user, string lang)
        {
            var userParameter = user != null ?
                new ObjectParameter("User", user) :
                new ObjectParameter("User", typeof(string));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<Node>("[MindDbContext].[GetNodes](@User, @Lang)", userParameter, langParameter);
        }
    
        public virtual IQueryable<NodeLookupInfo> NodeLookup(Nullable<int> rootNodeId, string user, string lang)
        {
            var rootNodeIdParameter = rootNodeId.HasValue ?
                new ObjectParameter("RootNodeId", rootNodeId) :
                new ObjectParameter("RootNodeId", typeof(int));
    
            var userParameter = user != null ?
                new ObjectParameter("User", user) :
                new ObjectParameter("User", typeof(string));
    
            var langParameter = lang != null ?
                new ObjectParameter("Lang", lang) :
                new ObjectParameter("Lang", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.CreateQuery<NodeLookupInfo>("[MindDbContext].[NodeLookup](@RootNodeId, @User, @Lang)", rootNodeIdParameter, userParameter, langParameter);
        }

	}
}