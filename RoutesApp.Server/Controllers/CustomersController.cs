
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using RoutesApp.Server.Models.CustomRoutes;
using RoutesApp.Server.Models.DTOS;
using System.Globalization;
using BCrypt.Net;

[ApiController]
[Route("[controller]")]
public class CustomersController : Controller
{
    private readonly CustomRoutesContext _context;
    public CustomersController(CustomRoutesContext context)
    {
        _context = context;
    }

    //Registrar Nuevo Usuario
    [HttpPost("Register")]
    public async Task<IActionResult> PostCustomer(CustomerDTO customerDto)
    {
        if (customerDto == null) return BadRequest("Customer data is null.");
        if (string.IsNullOrEmpty(customerDto.email) || string.IsNullOrEmpty(customerDto.password)) return BadRequest("Email and password are required.");
        try
        {
            var existeUsuario = await _context.Customers.AnyAsync(c => c.Email == customerDto.email);
            if (existeUsuario) return BadRequest("El correo electrónico ya está registrado.");
            string salt = BCrypt.Net.BCrypt.GenerateSalt(12);
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(customerDto.password, salt);
            var nuevoCustomer = new Customer
            {
                Name = customerDto.name ?? string.Empty,
                LastName = customerDto.last_name ?? string.Empty,
                PhoneNumber = customerDto.phone_number,
                Email = customerDto.email,
                Password = System.Text.Encoding.UTF8.GetBytes(passwordHash)
            };
            _context.Customers.Add(nuevoCustomer);
            await _context.SaveChangesAsync();
            return StatusCode(21, new { mensaje = "¡Usuario creado con éxito!", id = nuevoCustomer.IdCustomer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }
    //Iniciar Sesión
    [HttpGet("Login")]
    public async Task<IActionResult> GetCustomer([FromQuery] string email, [FromQuery] string password)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
        if (customer == null) return BadRequest("Usuario no encontrado.");
        if (!BCrypt.Net.BCrypt.Verify(password, System.Text.Encoding.UTF8.GetString(customer.Password))) return BadRequest("Contraseña incorrecta.");
        return Ok(new { mensaje = "¡Inicio de sesión exitoso!", id = customer.IdCustomer });
    }
}
