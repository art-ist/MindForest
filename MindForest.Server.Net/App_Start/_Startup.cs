using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;
using System.Web.Http;
using System.Web.Mvc;
using MindForest.StartUp;

[assembly: OwinStartup(typeof(MindForest.Auth))]

namespace MindForest {

	public partial class Auth {
		public Auth() {
		}

		public void Configuration(IAppBuilder app) {

			GlobalFilters.Filters.Add(new HandleErrorAttribute());

			IdentityConfig.Configure(app); 

			GlobalConfiguration.Configure(WebApiConfig.Register);

		}

	}

}
