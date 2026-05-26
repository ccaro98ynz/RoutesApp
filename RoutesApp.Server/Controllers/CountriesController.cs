using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace RoutesApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CountriesController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private const string RestCountriesUrl = "https://restcountries.com/v3.1";

        public CountriesController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query)) return Ok(new List<object>());

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("User-Agent", "HttpClientCore-App");
                var url = $"{RestCountriesUrl}/name/{Uri.EscapeDataString(query.Trim())}?fields=name,cca2,flags,latlng,capital,population";
                var response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                    return Ok(new List<object>());

                var content = await response.Content.ReadAsStringAsync();

                using var document = JsonDocument.Parse(content);
                var countries = document.RootElement
                                        .EnumerateArray()
                                        .Take(6)
                                        .ToList();
                var json = JsonSerializer.Serialize(countries);
                Console.WriteLine(json);
                return Content(json, "application/json");
            }
            catch (Exception ex)
            {

               return BadRequest(ex.Message);
            }
           
        }
    }
}  