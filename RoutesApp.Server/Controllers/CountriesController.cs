using Microsoft.AspNetCore.Mvc;

namespace RoutesApp.Server.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
