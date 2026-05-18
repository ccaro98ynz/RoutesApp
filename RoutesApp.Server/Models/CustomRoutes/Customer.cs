using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.CustomRoutes;

public partial class Customer
{
    public int IdCustomer { get; set; }

    public string Name { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string Email { get; set; } = null!;

    public byte[]? Password { get; set; }

    public virtual ICollection<Route> Routes { get; set; } = new List<Route>();
}
