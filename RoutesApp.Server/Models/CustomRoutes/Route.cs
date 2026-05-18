using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.CustomRoutes;

public partial class Route
{
    public int IdRoute { get; set; }

    public int IdCustomer { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string? TravelerType { get; set; }

    public int? TotalGuests { get; set; }

    public virtual Customer IdCustomerNavigation { get; set; } = null!;

    public virtual ICollection<Visited> Visiteds { get; set; } = new List<Visited>();

    public virtual ICollection<Interest> IdInterests { get; set; } = new List<Interest>();
}
