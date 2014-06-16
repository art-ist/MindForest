using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using MindForest.Models;
using MindForest.Providers;

namespace MindForest.Controllers {
	[Authorize]
	[RoutePrefix("api/Identity")]
	public class IdentityController : ApiController {
		private const string LocalLoginProvider = "Local";
		private AppUserManager _userManager;

		public IdentityController() {
		}

		public IdentityController(AppUserManager userManager,
				ISecureDataFormat<AuthenticationTicket> accessTokenFormat) {
			UserManager = userManager;
			AccessTokenFormat = accessTokenFormat;
		}

		public AppUserManager UserManager {
			get {
				return _userManager ?? Request.GetOwinContext().GetUserManager<AppUserManager>();
			}
			private set {
				_userManager = value;
			}
		}

		public ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; private set; }

		// GET api/Identity/UserInfo
		[HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
		[Route("UserInfo")]
		public UserInfoResult GetUserInfo() {
			ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

			return new UserInfoResult {
				Email = User.Identity.GetUserName(),
				HasRegistered = externalLogin == null,
				LoginProvider = externalLogin != null ? externalLogin.LoginProvider : null
			};
		}

		// POST api/Identity/Logout
		[Route("Logout")]
		public IHttpActionResult Logout() {
			Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
			return Ok();
		}

		// GET api/Identity/ManageInfo?returnUrl=%2F&generateState=true
		[Route("ManageInfo")]
		public async Task<ManageInfoResultModel> GetManageInfo(string returnUrl, bool generateState = false) {
			IdentityUser user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

			if (user == null) {
				return null;
			}

			List<UserLoginInfoResult> logins = new List<UserLoginInfoResult>();

			foreach (IdentityUserLogin linkedAccount in user.Logins) {
				logins.Add(new UserLoginInfoResult {
					LoginProvider = linkedAccount.LoginProvider,
					ProviderKey = linkedAccount.ProviderKey
				});
			}

			if (user.PasswordHash != null) {
				logins.Add(new UserLoginInfoResult {
					LoginProvider = LocalLoginProvider,
					ProviderKey = user.UserName,
				});
			}

			return new ManageInfoResultModel {
				LocalLoginProvider = LocalLoginProvider,
				Email = user.UserName,
				Logins = logins,
				ExternalLoginProviders = GetExternalLogins(returnUrl, generateState)
			};
		}

		// POST api/Identity/ChangePassword
		[Route("ChangePassword")]
		public async Task<IHttpActionResult> ChangePassword(ChangePasswordRequest model) {
			if (!ModelState.IsValid) {
				return BadRequest(ModelState);
			}

			IdentityResult result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.OldPassword,
					model.NewPassword);

			if (!result.Succeeded) {
				return GetErrorResult(result);
			}

			return Ok();
		}

		// POST api/Identity/SetPassword
		[Route("SetPassword")]
		public async Task<IHttpActionResult> SetPassword(SetPasswordRequest model) {
			if (!ModelState.IsValid) {
				return BadRequest(ModelState);
			}

			IdentityResult result = await UserManager.AddPasswordAsync(User.Identity.GetUserId(), model.NewPassword);

			if (!result.Succeeded) {
				return GetErrorResult(result);
			}

			return Ok();
		}

		// POST api/Identity/AddExternalLogin
		[Route("AddExternalLogin")]
		public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginRequest model) {
			if (!ModelState.IsValid) {
				return BadRequest(ModelState);
			}

			Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

			AuthenticationTicket ticket = AccessTokenFormat.Unprotect(model.ExternalAccessToken);

			if (ticket == null || ticket.Identity == null || (ticket.Properties != null
					&& ticket.Properties.ExpiresUtc.HasValue
					&& ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow)) {
				return BadRequest("External login failure.");
			}

			ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

			if (externalData == null) {
				return BadRequest("The external login is already associated with an account.");
			}

			IdentityResult result = await UserManager.AddLoginAsync(User.Identity.GetUserId(),
					new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

			if (!result.Succeeded) {
				return GetErrorResult(result);
			}

			return Ok();
		}

		// POST api/Identity/RemoveLogin
		[Route("RemoveLogin")]
		public async Task<IHttpActionResult> RemoveLogin(RemoveLoginRequestModel model) {
			if (!ModelState.IsValid) {
				return BadRequest(ModelState);
			}

			IdentityResult result;

			if (model.LoginProvider == LocalLoginProvider) {
				result = await UserManager.RemovePasswordAsync(User.Identity.GetUserId());
			}
			else {
				result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(),
						new UserLoginInfo(model.LoginProvider, model.ProviderKey));
			}

			if (!result.Succeeded) {
				return GetErrorResult(result);
			}

			return Ok();
		}

		// GET api/Identity/ExternalLogin
		[OverrideAuthentication]
		[HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
		[AllowAnonymous]
		[Route("ExternalLogin", Name = "ExternalLogin")]
		public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null) {
			if (error != null) {
				return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
			}

			if (!User.Identity.IsAuthenticated) {
				return new ChallengeResult(provider, this);
			}

			ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

			if (externalLogin == null) {
				return InternalServerError();
			}

			if (externalLogin.LoginProvider != provider) {
				Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
				return new ChallengeResult(provider, this);
			}

			AppUser user = await UserManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
					externalLogin.ProviderKey));

			bool hasRegistered = user != null;

			if (hasRegistered) {
				Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

				ClaimsIdentity oAuthIdentity = await user.GenerateUserIdentityAsync(UserManager,
					 OAuthDefaults.AuthenticationType);
				ClaimsIdentity cookieIdentity = await user.GenerateUserIdentityAsync(UserManager,
						CookieAuthenticationDefaults.AuthenticationType);

				AuthenticationProperties properties = OAuthProvider.CreateProperties(user);
				Authentication.SignIn(properties, oAuthIdentity, cookieIdentity);
			}
			else {
				IEnumerable<Claim> claims = externalLogin.GetClaims();
				ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
				Authentication.SignIn(identity);
			}

			return Ok();
		}

		// GET api/Identity/ExternalLogins?returnUrl=%2F&generateState=true
		[AllowAnonymous]
		[Route("ExternalLogins")]
		public IEnumerable<ExternalLoginResult> GetExternalLogins(string returnUrl, bool generateState = false) {
			IEnumerable<AuthenticationDescription> descriptions = Authentication.GetExternalAuthenticationTypes();
			List<ExternalLoginResult> logins = new List<ExternalLoginResult>();

			string state;

			if (generateState) {
				const int strengthInBits = 256;
				state = RandomOAuthStateGenerator.Generate(strengthInBits);
			}
			else {
				state = null;
			}

			foreach (AuthenticationDescription description in descriptions) {
				ExternalLoginResult login = new ExternalLoginResult {
					Name = description.Caption,
					Url = Url.Route("ExternalLogin", new {
						provider = description.AuthenticationType,
						response_type = "token",
						client_id = Startup.PublicClientId,
						redirect_uri = new Uri(Request.RequestUri, returnUrl).AbsoluteUri,
						state = state
					}),
					State = state
				};
				logins.Add(login);
			}

			return logins;
		}

		// POST api/Identity/Register
		[AllowAnonymous]
		[Route("Register")]
		public async Task<IHttpActionResult> Register(RegisterRequest model) {
			if (!ModelState.IsValid) {
				return BadRequest(ModelState);
			}

			var user = new AppUser() { UserName = model.Email, Email = model.Email };

			IdentityResult result = await UserManager.CreateAsync(user, model.Password);

			if (!result.Succeeded) {
				return GetErrorResult(result);
			}

			return Ok();
		}

		// POST api/Identity/RegisterExternal
		[OverrideAuthentication]
		[HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
		[Route("RegisterExternal")]
		public async Task<IHttpActionResult> RegisterExternal(RegisterExternalRequest model) {
			if (!ModelState.IsValid) {
				return BadRequest(ModelState);
			}

			var info = await Authentication.GetExternalLoginInfoAsync();
			if (info == null) {
				return InternalServerError();
			}

			var user = new AppUser() { UserName = model.Email, Email = model.Email };

			IdentityResult result = await UserManager.CreateAsync(user);
			if (!result.Succeeded) {
				return GetErrorResult(result);
			}

			result = await UserManager.AddLoginAsync(user.Id, info.Login);
			if (!result.Succeeded) {
				return GetErrorResult(result);
			}
			return Ok();
		}

		protected override void Dispose(bool disposing) {
			if (disposing) {
				UserManager.Dispose();
			}

			base.Dispose(disposing);
		}

		#region Helpers

		private IAuthenticationManager Authentication {
			get { return Request.GetOwinContext().Authentication; }
		}

		private IHttpActionResult GetErrorResult(IdentityResult result) {
			if (result == null) {
				return InternalServerError();
			}

			if (!result.Succeeded) {
				if (result.Errors != null) {
					foreach (string error in result.Errors) {
						ModelState.AddModelError("", error);
					}
				}

				if (ModelState.IsValid) {
					// No ModelState errors are available to send, so just return an empty BadRequest.
					return BadRequest();
				}

				return BadRequest(ModelState);
			}

			return null;
		}

		private class ExternalLoginData {
			public string LoginProvider { get; set; }
			public string ProviderKey { get; set; }
			public string UserName { get; set; }

			public IList<Claim> GetClaims() {
				IList<Claim> claims = new List<Claim>();
				claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

				if (UserName != null) {
					claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
				}

				return claims;
			}

			public static ExternalLoginData FromIdentity(ClaimsIdentity identity) {
				if (identity == null) {
					return null;
				}

				Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

				if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
						|| String.IsNullOrEmpty(providerKeyClaim.Value)) {
					return null;
				}

				if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer) {
					return null;
				}

				return new ExternalLoginData {
					LoginProvider = providerKeyClaim.Issuer,
					ProviderKey = providerKeyClaim.Value,
					UserName = identity.FindFirstValue(ClaimTypes.Name)
				};
			}
		}

		private static class RandomOAuthStateGenerator {
			private static RandomNumberGenerator _random = new RNGCryptoServiceProvider();

			public static string Generate(int strengthInBits) {
				const int bitsPerByte = 8;

				if (strengthInBits % bitsPerByte != 0) {
					throw new ArgumentException("strengthInBits must be evenly divisible by 8.", "strengthInBits");
				}

				int strengthInBytes = strengthInBits / bitsPerByte;

				byte[] data = new byte[strengthInBytes];
				_random.GetBytes(data);
				return HttpServerUtility.UrlTokenEncode(data);
			}
		}

		#endregion
	}
}
