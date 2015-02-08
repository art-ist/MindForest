using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;
using System.Web.Http;
using System.Web.Mvc;

[assembly: OwinStartup(typeof(MindForest.Auth))]

namespace MindForest {

	public partial class Auth {
		public Auth() {
			Auth.Startup();
		}

		public void Configuration(IAppBuilder app) {

			GlobalFilters.Filters.Add(new HandleErrorAttribute());

			Auth.Configure(app); 

			GlobalConfiguration.Configure(WebApiConfig.Register);

		}

	}

}
