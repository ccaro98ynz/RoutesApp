using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RoutesApp.Server.Models.RoutesApp;

public partial class RoutesAppContext : DbContext
{
    public RoutesAppContext()
    {
    }

    public RoutesAppContext(DbContextOptions<RoutesAppContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Place> Places { get; set; }

    public virtual DbSet<Route> Routes { get; set; }

    public virtual DbSet<Visited> Visiteds { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:dbcs");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.IdCustomer).HasName("PK__Customer__8CC9BA46FD4F7BF7");

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
            entity.Property(e => e.Password)
                .HasMaxLength(8000)
                .HasColumnName("password");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone_number");
        });

        modelBuilder.Entity<Place>(entity =>
        {
            entity.HasKey(e => e.IdPlace).HasName("PK__Place__04D478F4F87AD93C");

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
            entity.HasKey(e => e.IdRoute).HasName("PK__Routes__3C8882D0138CD586");

            entity.Property(e => e.IdRoute).HasColumnName("id_route");
            entity.Property(e => e.EndDate)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("end_date");
            entity.Property(e => e.IdCustomer).HasColumnName("id_customer");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("start_date");

            entity.HasOne(d => d.IdCustomerNavigation).WithMany(p => p.Routes)
                .HasForeignKey(d => d.IdCustomer)
                .HasConstraintName("fk_id_customer");
        });

        modelBuilder.Entity<Visited>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("Visited");

            entity.Property(e => e.IdPlace).HasColumnName("id_place");
            entity.Property(e => e.IdRoute).HasColumnName("id_route");
            entity.Property(e => e.VisitedAt)
                .HasColumnType("datetime")
                .HasColumnName("visited_at");

            entity.HasOne(d => d.IdPlaceNavigation).WithMany()
                .HasForeignKey(d => d.IdPlace)
                .HasConstraintName("fk_id_place");

            entity.HasOne(d => d.IdRouteNavigation).WithMany()
                .HasForeignKey(d => d.IdRoute)
                .HasConstraintName("fk_id_route");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
