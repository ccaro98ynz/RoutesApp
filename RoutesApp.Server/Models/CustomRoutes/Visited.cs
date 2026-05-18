using System;
using System.Collections.Generic;

namespace RoutesApp.Server.Models.CustomRoutes;

public partial class Visited
{
    public int IdRoute { get; set; }

    public int IdPlace { get; set; }

    public DateTime VisitedAt { get; set; }

    public virtual Place IdPlaceNavigation { get; set; } = null!;

    public virtual Route IdRouteNavigation { get; set; } = null!;
}
