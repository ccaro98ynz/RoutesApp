using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.CustomRoutes;

public partial class Interest
{
    public int IdInterests { get; set; }

    public string Description { get; set; } = null!;

    public virtual ICollection<Route> IdRoutes { get; set; } = new List<Route>();
}
