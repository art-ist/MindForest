using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace MindForest.Models {
	//Models used by the IdentityController

	#region Requests
	// Models used as parameters to IdentityController actions.

	public class AddExternalLoginRequest {
		[Required]
		[Display(Name = "External access token")]
		public string ExternalAccessToken { get; set; }
	}

	public class ChangePasswordRequest {
		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Current password")]
		public string OldPassword { get; set; }

		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPassword { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Confirm new password")]
		[Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}

	public class RegisterRequest {
		[Required]
		[Display(Name = "Email")]
		public string Email { get; set; }

		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "Password")]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Confirm password")]
		[Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}

	public class RegisterExternalRequest {
		[Required]
		[Display(Name = "Email")]
		public string Email { get; set; }
	}

	public class RemoveLoginRequestModel {
		[Required]
		[Display(Name = "Login provider")]
		public string LoginProvider { get; set; }

		[Required]
		[Display(Name = "Provider key")]
		public string ProviderKey { get; set; }
	}

	public class SetPasswordRequest {
		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPassword { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Confirm new password")]
		[Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }
	}

	#endregion Requests

	#region Results
	// Models returned by IdentityController actions.

	public class ExternalLoginResult {
		public string Name { get; set; }

		public string Url { get; set; }

		public string State { get; set; }
	}

	public class ManageInfoResultModel {
		public string LocalLoginProvider { get; set; }

		public string Email { get; set; }

		public IEnumerable<UserLoginInfoResult> Logins { get; set; }

		public IEnumerable<ExternalLoginResult> ExternalLoginProviders { get; set; }
	}

	public class UserInfoResult {
		public string Email { get; set; }

		public bool HasRegistered { get; set; }

		public string LoginProvider { get; set; }
	}

	public class UserLoginInfoResult {
		public string LoginProvider { get; set; }

		public string ProviderKey { get; set; }
	}

	#endregion Results

}
