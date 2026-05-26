namespace RoutesApp.Server.Models.DTOS
{
    public class CreatePlaceDTO
    {
        public string IdExternal { get; set; } = "";
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string AddressLine { get; set; } = "";
        public string City { get; set; } = "";
        public string PostalCode { get; set; } = "";
        public string CountryCode { get; set; } = "";
    }
}
