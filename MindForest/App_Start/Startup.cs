using Microsoft.Owin;
using Owin;

//[assembly: OwinStartup(typeof(MindForest.Startup))]

namespace MindForest {

	public partial class Startup {

		public void Configuration(IAppBuilder app) {
			//other startup configs see Global.asax
			ConfigureAuth(app);
		}

	}

}
