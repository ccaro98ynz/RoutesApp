using Microsoft.EntityFrameworkCore;
using RoutesApp.Server.Models.CustomRoutes;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddDbContext<CustomRoutesContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("dbContext")));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("https://localhost:53424", "http://localhost:53424") // Tu puerto de React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("PermitirReact");

app.UseAuthorization();
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
