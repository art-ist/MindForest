using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using MindForest.Models;

namespace MindForest {
	// Configure the user manager used in this application. UserManager is defined in ASP.NET Identity and is used by the application.

	public class AppUserManager : UserManager<AppUser> {

		public AppUserManager(IUserStore<AppUser> store)
			: base(store) {
		}

		public static AppUserManager Create(IdentityFactoryOptions<AppUserManager> options, IOwinContext context) {
			var manager = new AppUserManager(new UserStore<AppUser>(context.Get<IdentityContext>()));
			// Configure validation logic for usernames
			manager.UserValidator = new UserValidator<AppUser>(manager) {
				AllowOnlyAlphanumericUserNames = false,
				RequireUniqueEmail = true
			};
			// Configure validation logic for passwords
			manager.PasswordValidator = new PasswordValidator {
				RequiredLength = 4,
				RequireNonLetterOrDigit = false,
				RequireDigit = false,
				RequireLowercase = false,
				RequireUppercase = false,
			};
			var dataProtectionProvider = options.DataProtectionProvider;
			if (dataProtectionProvider != null) {
				manager.UserTokenProvider = new DataProtectorTokenProvider<AppUser>(dataProtectionProvider.Create("ASP.NET Identity"));
			}
			return manager;
		}

	} //class

} //ns
