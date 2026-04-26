using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.RoutesApp;

public partial class Customer
{
    public int IdCustomer { get; set; }

    public string? Name { get; set; }

    public string? LastName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public byte[]? Password { get; set; }

    public virtual ICollection<Route> Routes { get; set; } = new List<Route>();
}
