using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System.Configuration;

namespace MindForest.Models {

	public class IdentityContext : IdentityDbContext<AppUser> {
		private static string _forest;

		//get default connection from config
		static IdentityContext() {
			_forest = ConfigurationManager.AppSettings["DefaultForest"];
		}
		//constructor: initialize db connection
		public IdentityContext()
			: base(_forest + "Db") {
			//this.Database.Connection.ConnectionString = ConfigurationManager.ConnectionStrings[_forest + "Db"].ConnectionString;
			this.Configuration.LazyLoadingEnabled = false;
		}
		public IdentityContext(string Forest)
			: base(Forest + "Db") {
			//if (string.IsNullOrEmpty(Forest)) {
			//	Forest = _forest;
			//}
			//this.Database.Connection.ConnectionString = ConfigurationManager.ConnectionStrings[Forest + "Db"].ConnectionString;
			this.Configuration.LazyLoadingEnabled = false;
		}

		//factory to create context
		public static IdentityContext Create() {
			return new IdentityContext();
		}
		public static IdentityContext Create(string Forest) {
			return new IdentityContext(Forest);
		}

		//configure/customize db schema
		protected override void OnModelCreating(System.Data.Entity.DbModelBuilder modelBuilder) {
			base.OnModelCreating(modelBuilder);

			//override identity table and schema mappings
			modelBuilder.Entity<AppUser>().ToTable("Users", "App");
			modelBuilder.Entity<IdentityUser>().ToTable("Users", "App");
			modelBuilder.Entity<IdentityRole>().ToTable("Roles", "App");
			modelBuilder.Entity<IdentityUserRole>().ToTable("UserRoles", "App");
			modelBuilder.Entity<IdentityUserLogin>().ToTable("UserExternalLogins", "App");
			modelBuilder.Entity<IdentityUserClaim>().ToTable("UserClaims", "App");

		}

	} //class IdentityContext
} //ns