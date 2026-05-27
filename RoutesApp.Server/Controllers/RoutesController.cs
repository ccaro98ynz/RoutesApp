using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutesApp.Server.Models.CustomRoutes;
using RoutesApp.Server.Models.DTOS;

namespace RoutesApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly CustomRoutesContext _context;

    public RoutesController(CustomRoutesContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRouteDTO dto)
    {
        try
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var route = new Models.CustomRoutes.Route
            {
                IdCustomer = dto.IdCustomer,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TravelerType = dto.TravelerType,
                TotalGuests = dto.TotalGuests
            };

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();

            foreach (var interestId in dto.InterestIds)
            {
                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO Specifications (id_route, id_interests)
                VALUES ({route.IdRoute}, {interestId})
            ");
            }

            foreach (var placeDto in dto.Places)
            {
                var place = await _context.Places
                    .FirstOrDefaultAsync(p => p.IdExternal == placeDto.IdExternal);

                if (place == null)
                {
                    place = new Place
                    {
                        IdExternal = placeDto.IdExternal,
                        Latitude = placeDto.Latitude,
                        Longitude = placeDto.Longitude,
                        AddressLine = placeDto.AddressLine,
                        City = placeDto.City,
                        PostalCode = placeDto.PostalCode,
                        CountryCode = placeDto.CountryCode
                    };

                    _context.Places.Add(place);
                    await _context.SaveChangesAsync();
                }

                _context.Visiteds.Add(new Visited
                {
                    IdRoute = route.IdRoute,
                    IdPlace = place.IdPlace,
                    VisitedAt = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { routeId = route.IdRoute });
        }
        catch (Exception ex)
        {

            return StatusCode(500, ex.ToString());
        }
        
    }
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetRoutesByCustomer(int customerId)
    {
        var routes = await _context.Routes
            .Where(r => r.IdCustomer == customerId)
            .Select(r => new
            {
                idRoute = r.IdRoute,
                startDate = r.StartDate,
                endDate = r.EndDate,
                travelerType = r.TravelerType,
                totalGuests = r.TotalGuests,

                places = _context.Visiteds
                    .Where(v => v.IdRoute == r.IdRoute)
                    .Join(
                        _context.Places,
                        v => v.IdPlace,
                        p => p.IdPlace,
                        (v, p) => new
                        {
                            idPlace = p.IdPlace,
                            name = p.AddressLine,
                            city = p.City,
                            latitude = p.Latitude,
                            longitude = p.Longitude,
                            visitedAt = v.VisitedAt
                        }
                    )
                    .ToList()
            })
            .OrderByDescending(r => r.startDate)
            .ToListAsync();

        return Ok(routes);
    }
    [HttpDelete("{routeId}/places/{placeId}")]
    public async Task<IActionResult> RemovePlaceFromRoute(int routeId, int placeId)
    {
        var visited = await _context.Visiteds
            .FirstOrDefaultAsync(v => v.IdRoute == routeId && v.IdPlace == placeId);

        if (visited == null)
            return NotFound("Ese lugar no existe en esta ruta.");

        _context.Visiteds.Remove(visited);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Lugar eliminado de la ruta.",
            routeId,
            placeId
        });
    }
}