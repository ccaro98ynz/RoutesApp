using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RoutesApp.Server.Models.CustomRoutes;

public partial class CustomRoutesContext : DbContext
{
    public CustomRoutesContext()
    {
    }

    public CustomRoutesContext(DbContextOptions<CustomRoutesContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Interest> Interests { get; set; }

    public virtual DbSet<Place> Places { get; set; }

    public virtual DbSet<Route> Routes { get; set; }

    public virtual DbSet<Visited> Visiteds { get; set; }


    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:dbContext");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.IdCustomer).HasName("PK__Customer__8CC9BA468D0F4B29");

            entity.Property(e => e.IdCustomer).HasColumnName("id_customer");
            entity.Property(e => e.Email)
                .HasMaxLength(40)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.LastName)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("last_name");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone_number");
        });

        modelBuilder.Entity<Interest>(entity =>
        {
            entity.HasKey(e => e.IdInterests).HasName("PK__Interest__9AA64BCBACB02724");

            entity.Property(e => e.IdInterests).HasColumnName("id_interests");
            entity.Property(e => e.Description)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("description");
        });

        modelBuilder.Entity<Place>(entity =>
        {
            entity.HasKey(e => e.IdPlace).HasName("PK__Place__04D478F4314690AF");

            entity.ToTable("Place");

            entity.Property(e => e.IdPlace).HasColumnName("id_place");
            entity.Property(e => e.AddressLine)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("address_line");
            entity.Property(e => e.City)
                .HasMaxLength(25)
                .IsUnicode(false)
                .HasColumnName("city");
            entity.Property(e => e.CountryCode)
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasColumnName("country_code");
            entity.Property(e => e.IdExternal)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("id_external");
            entity.Property(e => e.Latitude)
                .HasColumnType("decimal(10, 8)")
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasColumnType("decimal(11, 8)")
                .HasColumnName("longitude");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(12)
                .IsUnicode(false)
                .HasColumnName("postal_code");
        });

        modelBuilder.Entity<Route>(entity =>
        {
            entity.HasKey(e => e.IdRoute).HasName("PK__Routes__3C8882D062B887ED");

            entity.Property(e => e.IdRoute).HasColumnName("id_route");
            entity.Property(e => e.EndDate)
                .HasColumnType("datetime")
                .HasColumnName("end_date");
            entity.Property(e => e.IdCustomer).HasColumnName("id_customer");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("start_date");
            entity.Property(e => e.TotalGuests).HasColumnName("total_guests");
            entity.Property(e => e.TravelerType)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("traveler_type");

            entity.HasOne(d => d.IdCustomerNavigation).WithMany(p => p.Routes)
                .HasForeignKey(d => d.IdCustomer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Routers_Customers");

            entity.HasMany(d => d.IdInterests).WithMany(p => p.IdRoutes)
                .UsingEntity<Dictionary<string, object>>(
                    "Specification",
                    r => r.HasOne<Interest>().WithMany()
                        .HasForeignKey("IdInterests")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_Specifications_Interests"),
                    l => l.HasOne<Route>().WithMany()
                        .HasForeignKey("IdRoute")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_Specifications_Routers"),
                    j =>
                    {
                        j.HasKey("IdRoute", "IdInterests");
                        j.ToTable("Specifications");
                        j.IndexerProperty<int>("IdRoute").HasColumnName("id_route");
                        j.IndexerProperty<int>("IdInterests").HasColumnName("id_interests");
                    });
        });

        modelBuilder.Entity<Visited>(entity =>
        {
            entity.HasKey(e => new { e.IdRoute, e.IdPlace });

            entity.ToTable("Visited");

            entity.Property(e => e.IdRoute).HasColumnName("id_route");
            entity.Property(e => e.IdPlace).HasColumnName("id_place");
            entity.Property(e => e.VisitedAt)
                .HasColumnType("datetime")
                .HasColumnName("visited_at");

            entity.HasOne(d => d.IdPlaceNavigation).WithMany(p => p.Visiteds)
                .HasForeignKey(d => d.IdPlace)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Visited_Place");

            entity.HasOne(d => d.IdRouteNavigation).WithMany(p => p.Visiteds)
                .HasForeignKey(d => d.IdRoute)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Visited_Routers");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
