using System.Web.Http;
using System.Security.Principal;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Linq;
using MindForest.Models;
//using Thinktecture.IdentityModel.Tokens.Http;
using System.Net;

namespace MindForest.Controllers {

  public class IdentityController : ApiController {

  //  [Authorize]
  //  public ViewClaims Get() {
  //    return ViewClaims.GetAll();
  //  }

  //  //[Authorize]
  //  //public UserProfile GetUserProfile() {
  //  //  var db = new MindContextProvider(null);
  //  //  var principal = ClaimsPrincipal.Current;
  //  //  return db.Context.UserProfiles
  //  //    .Include("Roles")
  //  //    .Where(it => it.UserName == principal.Identity.Name)
  //  //    .FirstOrDefault()
  //  //    ;
  //  //}

  //  //ToDo: Replace with real implementation
  //  private class UserInfo {
  //    public int      Id { get; set; }
  //    public string   Name { get; set; }  
  //    public string   Pwd { get; set; }
  //    public string[] Roles { get; set; }
  //  }
  //  private static Dictionary<string, UserInfo> users = new Dictionary<string, UserInfo>();

  //  static IdentityController()
  //  { 
  //    users.Add("Michael", new UserInfo() { Id=1, Name = "M", Pwd="o", Roles= new string[] {"Admin", "Owner", "Author"} });
  //    users.Add("Ira", new UserInfo() { Id=2, Name = "I", Pwd="m", Roles= new string[] {"Owner", "Author"} });
  //  }

  //  public static bool ValidateUser(string userName, string password) {
  //    if (users.ContainsKey(userName)) {
  //      if (users[userName].Pwd == password) {
  //        return true;
  //      }
  //    }
  //    throw new AuthenticationException {
  //      StatusCode = HttpStatusCode.BadRequest,
  //      ReasonPhrase = "Login failed"
  //    };
  //  }
  //  public static string[] GetRoles(string userName) { 
  //    return users[userName].Roles;
  //  }
  //}

  //public class ViewClaims : List<ViewClaim> {

  //  public static ViewClaims GetAll() {
  //    var principal = ClaimsPrincipal.Current;
  //    var claims = new List<ViewClaim>(
  //        from c in principal.Claims
  //        select new ViewClaim {
  //          Type = c.Type,
  //          Value = c.Value
  //        });
  //    var vc = new ViewClaims();
  //    vc.AddRange(claims);

  //    return vc;
  //  }
  }

  public class ViewClaim {
    public string Type { get; set; }
    public string Value { get; set; }
  }

}



//namespace MindForest.Security {

//  public class Identity {
//    public string Name { get; set; }
//    public string AuthenticationType { get; set; }
//    public bool IsAuthenticated { get; set; }
//    public string ClrType { get; set; }

//    //public ClaimsDto Claims { get; set; }

//    public Identity() { }

//    public Identity(IIdentity identity) {
//      if (identity == null) {
//        //throw new ArgumentNullException("identity");
//        Name = "Anonymous";
//        IsAuthenticated = false;
//        //ClrType = null;
//        return;
//      }

//      ClrType = identity.GetType().FullName;

//      if (!identity.IsAuthenticated) {
//        Name = "Anonymous";
//        IsAuthenticated = false;
//        return;
//      }

//      Name = identity.Name;
//      AuthenticationType = identity.AuthenticationType;
//      IsAuthenticated = true;

//      //var claimsIdentity = identity as ClaimsIdentity;
//      //if (claimsIdentity != null) {
//      //  Claims = new ClaimsDto();
//      //  claimsIdentity.Claims.ToList().ForEach(c => Claims.Add(new ClaimDto {
//      //    ClaimType = c.Type,
//      //    Value = c.Value,
//      //    Issuer = c.Issuer,
//      //    OriginalIssuer = c.OriginalIssuer
//      //  }));
//      //}
//    }
//  }

//  //public class ClaimsDto : List<ClaimDto> {
//  //  public ClaimsDto() { }

//  //  public ClaimsDto(IEnumerable<ClaimDto> claims)
//  //    : base(claims) { }
//  //}

//  //public class ClaimDto {
//  //  public string ClaimType { get; set; }
//  //  public string Value { get; set; }
//  //  public string Issuer { get; set; }
//  //  public string OriginalIssuer { get; set; }
//  //}

//}