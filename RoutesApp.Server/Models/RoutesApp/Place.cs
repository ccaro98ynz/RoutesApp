using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.RoutesApp;

public partial class Place
{
    public int IdPlace { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string? AddressLine { get; set; }

    public string? City { get; set; }

    public string? PostalCode { get; set; }

    public string? CountryCode { get; set; }
}
