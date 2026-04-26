using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using RoutesApp.Server.Models.RoutesApp;
using RoutesApp.Server.Models.DTOS; 
namespace RoutesApp.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CustomersController : Controller
    {
        private readonly RoutesAppContext _context;

        public CustomersController(RoutesAppContext context)
        {
            _context = context;
        }

        // GET: Customers
        [HttpGet("GetList")]
        public async Task<ActionResult<IEnumerable<CustomerDTO>>> Customer_data()
        {
            var customerList = await _context.Customers.Select(
               a => new CustomerDTO
               {
                   Name = a.Name,
                   last_name = a.LastName,
                   phone_number = a.PhoneNumber,
                   email = a.Email,
               }).ToListAsync();
            return Ok(customerList);
        }


    }
}
