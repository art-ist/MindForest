﻿using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
//using System.Web.Optimization;

namespace MindForest {
	// Note: For instructions on enabling IIS6 or IIS7 classic mode, 
	// visit http://go.microsoft.com/?LinkId=9394801

	public class WebApiApplication : System.Web.HttpApplication {
		protected void Application_Start() {
			//AreaRegistration.RegisterAllAreas();

			GlobalConfiguration.Configure(WebApiConfig.Register); //App_Start/WebApiConfig
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);

			//other startup configs see //App_Start/Startup.cs
		}
	}
}