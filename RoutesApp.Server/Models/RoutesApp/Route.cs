using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.RoutesApp;

public partial class Route
{
    public int? IdCustomer { get; set; }

    public int IdRoute { get; set; }

    public DateTime? StartDate { get; set; }

    public string? EndDate { get; set; }

    public virtual Customer? IdCustomerNavigation { get; set; }
}
