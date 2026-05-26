using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TuProyecto.Controllers
{
    // DTOs para recibir los datos desde el Frontend (React)
    public record StateRequest(string CountryName);
    public record CityRequest(string CountryName, string StateName);

    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private const string BaseUrl = "https://countriesnow.space/api/v0.1";

        public LocationsController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // 1. Endpoint para obtener Estados
        [HttpPost("states")]
        public async Task<IActionResult> GetStates([FromBody] StateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CountryName))
                return BadRequest("El nombre del país es requerido.");

            var client = _httpClientFactory.CreateClient();

            // Mapeamos al formato que espera la API externa
            var payload = new { country = request.CountryName };
            var jsonPayload = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{BaseUrl}/countries/states", jsonPayload);

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Error al consultar los estados en el servicio externo.");

            var content = await response.Content.ReadAsStringAsync();

            // Extraemos la propiedad "data.states" usando JsonDocument de forma dinámica
            using var document = JsonDocument.Parse(content);
            if (document.RootElement.TryGetProperty("data", out var dataElement) &&
                dataElement.TryGetProperty("states", out var statesElement))
            {
                return Content(statesElement.ToString(), "application/json");
            }

            return Ok(new object[] { });
        }

        // 2. Endpoint para obtener Ciudades
        [HttpPost("cities")]
        public async Task<IActionResult> GetCities([FromBody] CityRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CountryName) || string.IsNullOrWhiteSpace(request.StateName))
                return BadRequest("El país y el estado son requeridos.");

            var client = _httpClientFactory.CreateClient();

            // Mapeamos al formato de la API externa
            var payload = new { country = request.CountryName, state = request.StateName };
            var jsonPayload = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{BaseUrl}/countries/state/cities", jsonPayload);

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Error al consultar las ciudades en el servicio externo.");

            var content = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(content);
            if (document.RootElement.TryGetProperty("data", out var dataElement))
            {
                return Content(dataElement.ToString(), "application/json");
            }

            return Ok(new string[] { });
        }
    }
}