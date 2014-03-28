using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MindForest {
  public class RouteConfig {
    public static void RegisterRoutes(RouteCollection routes) {
      routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
      routes.IgnoreRoute("{resource}.svc/{*pathInfo}");

      routes.MapRoute(
        name: "Default",
        url: "{forest}/{controller}/{action}/{id}",
        defaults: new { forest = ConfigurationManager.AppSettings["DefaultForest"]
                      , controller = "Home"
                      , action = "Index"
                      , id = UrlParameter.Optional 
        }
      );
    } //RegisterRoutes

  } //class RouteConfig
} //ns