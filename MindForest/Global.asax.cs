﻿using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
//using System.Web.Optimization;

namespace MindForest {
  // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
  // visit http://go.microsoft.com/?LinkId=9394801

  public class MvcApplication : System.Web.HttpApplication {
    protected void Application_Start() {

      //SecurityConfig.ConfigureGlobal(GlobalConfiguration.Configuration);  //App_Start/SecurityConfig
      //FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
      GlobalConfiguration.Configure(WebApiConfig.Register); //App_Start/WebApiConfig
      RouteConfig.RegisterRoutes(RouteTable.Routes);  //App_Start/RouteConfig

    }
  }
}