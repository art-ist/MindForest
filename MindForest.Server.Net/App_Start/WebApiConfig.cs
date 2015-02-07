using System.Web.Http;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using System.Configuration;

namespace MindForest {
  public static class WebApiConfig {

    public static void Register(HttpConfiguration config) {

      // Web API configuration and services
      // Configure Web API to use only bearer token authentication.
      config.SuppressDefaultHostAuthentication();
      config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

      //Enable CORS (see: http://msdn.microsoft.com/en-us/magazine/dn532203.aspx)
      config.EnableCors();

      // Use camel case for JSON data.
      config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

      // Web API routes
      config.MapHttpAttributeRoutes();

      config.Routes.MapHttpRoute(
        name: "BreezeApi",
        routeTemplate: "api/{controller}/{action}",
        defaults: new { 
            controller = "Mind",
            action = "GetTrees",
            forest = ConfigurationManager.AppSettings["DefaultForest"]
          }
      );
      config.Routes.MapHttpRoute(
        name: "BreezeApiWithRegion",
        routeTemplate: "api/{forest}/{controller}/{action}",
        defaults: new {
            controller = "Mind", 
            action = "GetTrees",
            forest = ConfigurationManager.AppSettings["DefaultForest"]
          }
      );
    } //Register

  } //class WebApiConfig
} //ns
