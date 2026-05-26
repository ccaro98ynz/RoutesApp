namespace RoutesApp.Server.Models.DTOS
{
    public class CreateRouteDTO
    {
        public int IdCustomer { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string TravelerType { get; set; } = "";
        public int TotalGuests { get; set; }

        public List<int> InterestIds { get; set; } = new();
        public List<CreatePlaceDTO> Places { get; set; } = new();
    }
}
