using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.CustomRoutes;

public partial class Place
{
    public int IdPlace { get; set; }

    public string? IdExternal { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string? AddressLine { get; set; }

    public string? City { get; set; }

    public string? PostalCode { get; set; }

    public string? CountryCode { get; set; }

    public virtual ICollection<Visited> Visiteds { get; set; } = new List<Visited>();
}
