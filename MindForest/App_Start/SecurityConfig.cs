using MindForest.Security;
using System;
using System.Collections.Generic;
using System.IdentityModel.Selectors;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.IdentityModel;
//using Thinktecture.IdentityModel.Tokens;
//using Thinktecture.IdentityModel.Tokens.Http;
using MindForest.Controllers;

namespace MindForest {

  public class SecurityConfig {

    //public static void ConfigureGlobal(HttpConfiguration globalConfig) {
    //  globalConfig.MessageHandlers.Add(new AuthenticationHandler(CreateConfiguration()));
    //  globalConfig.Filters.Add(new SecurityExceptionFilter());
    //}

    //public static AuthenticationConfiguration CreateConfiguration() {
    //  var config = new AuthenticationConfiguration {
    //    RequireSsl = false
    //    //DefaultAuthenticationScheme = "Basic",
    //  };

    //  #region Basic Authentication

    //  config.AddBasicAuthentication(IdentityController.ValidateUser, IdentityController.GetRoles);
      
    //  #endregion
      
    //  return config;
    //}

  } //class
} //ns