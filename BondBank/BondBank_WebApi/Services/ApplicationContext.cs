using BondBank_WebApi.Models.DataBase;
using Microsoft.EntityFrameworkCore;

namespace BondBank_WebApi.Services;

public sealed class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    public DbSet<UsersModel> Users { get; set; }
    public DbSet<PassportsModel> Passports { get; set; }
    public DbSet<SnilsModel> Snils { get; set; }
    public DbSet<CurrencyRatesModel> CurrencyRates { get; set; }
    public DbSet<HistoryPortfoliosModel> HistoryPortfolios { get; set; }
    public DbSet<LjubljanaStockExchangeBondsModel> LjubljanaStockExchangeBonds { get; set; }
    public DbSet<MoscowExchangeBondsModel> MoscowExchangeBonds { get; set; }
    public DbSet<SixGroupBondsModel> SixGroupBonds { get; set; }
    public DbSet<WienerBoerseBondsModel> WienerBoerseBonds { get; set; }
    public DbSet<PortfoliosModel> Portfolios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        #region UsersModel_ConnectionsWithOthersModels

        // паспорт
        modelBuilder.Entity<UsersModel>()
            .HasOne(u => u.Passports)
            .WithOne(p => p.User)
            .HasForeignKey<UsersModel>(u => u.PassportId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        // снилс
        modelBuilder.Entity<UsersModel>()
            .HasOne(u => u.Snils)
            .WithOne(s => s.User)
            .HasForeignKey<UsersModel>(u => u.SnilsId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        // портфель
        modelBuilder.Entity<PortfoliosModel>()
            .HasOne(p => p.Users)
            .WithMany(u => u.Portfolios)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion

        #region LjubljanaStockExchangeBondsModel_ConnectionsWithOthersModels

        // портфель
        modelBuilder.Entity<LjubljanaStockExchangeBondsModel>()
            .HasOne(b => b.Portfolios)
            .WithMany(p => p.LjubljanaStockExchangeBonds)
            .HasForeignKey(b => b.PortfoliosId)
            .OnDelete(DeleteBehavior.SetNull);

        // курс
        modelBuilder.Entity<LjubljanaStockExchangeBondsModel>()
            .HasOne(b => b.CurrencyRates)
            .WithMany(cr => cr.LjubljanaStockExchangeBonds)
            .HasForeignKey(b => b.CurrencyRatesId)
            .OnDelete(DeleteBehavior.NoAction);

        #endregion

        #region MoscowExchangeBondsModel_ConnectionsWithOthersModels

        // портфель
        modelBuilder.Entity<MoscowExchangeBondsModel>()
            .HasOne(b => b.Portfolios)
            .WithMany(p => p.MoscowExchangeBonds)
            .HasForeignKey(b => b.PortfoliosId)
            .OnDelete(DeleteBehavior.SetNull);

        // курс
        modelBuilder.Entity<MoscowExchangeBondsModel>()
            .HasOne(b => b.CurrencyRates)
            .WithMany(cr => cr.MoscowExchangeBonds)
            .HasForeignKey(b => b.CurrencyRatesId)
            .OnDelete(DeleteBehavior.NoAction);

        #endregion

        #region SixGroupBondsModel_ConnectionsWithOthersModels

        // портфель
        modelBuilder.Entity<SixGroupBondsModel>()
            .HasOne(b => b.Portfolios)
            .WithMany(p => p.SixGroupBonds)
            .HasForeignKey(b => b.PortfoliosId)
            .OnDelete(DeleteBehavior.SetNull);

        // курс
        modelBuilder.Entity<SixGroupBondsModel>()
            .HasOne(b => b.CurrencyRates)
            .WithMany(cr => cr.SixGroupBonds)
            .HasForeignKey(b => b.CurrencyRatesId)
            .OnDelete(DeleteBehavior.NoAction);

        #endregion

        #region WienerBoerseBondsModel_ConnectionsWithOthersModels

        // портфель
        modelBuilder.Entity<WienerBoerseBondsModel>()
            .HasOne(b => b.Portfolios)
            .WithMany(p => p.WienerBoerseBonds)
            .HasForeignKey(b => b.PortfoliosId)
            .OnDelete(DeleteBehavior.SetNull);

        // курс
        modelBuilder.Entity<WienerBoerseBondsModel>()
            .HasOne(b => b.CurrencyRates)
            .WithMany(cr => cr.WienerBoerseBonds)
            .HasForeignKey(b => b.CurrencyRatesId)
            .OnDelete(DeleteBehavior.NoAction);

        #endregion

        #region HistoryPortfoliosModel_ConnectionsWithOthersModels

        // портфель
        modelBuilder.Entity<HistoryPortfoliosModel>()
            .HasOne(b => b.Portfolios)
            .WithMany(p => p.HistoryPortfolios)
            .HasForeignKey(b => b.PortfoliosId)
            .OnDelete(DeleteBehavior.Cascade);

        // пользователь
        modelBuilder.Entity<HistoryPortfoliosModel>()
            .HasOne(hp => hp.Users)
            .WithMany(u => u.HistoryPortfolios)
            .HasForeignKey(hp => hp.UsersId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion

        #region IX_Users

        modelBuilder.Entity<UsersModel>()
            .HasIndex(u => new { u.SecondName, u.FirstName, u.SurName })
            .HasDatabaseName("IX_Users_FullName");
        modelBuilder.Entity<UsersModel>()
            .HasIndex(u => u.PhoneNumber)
            .HasDatabaseName("IX_Users_PhoneNumber")
            .IsUnique();
        modelBuilder.Entity<UsersModel>()
            .HasIndex(u => u.EmailAddress)
            .HasDatabaseName("IX_Users_EmailAddress")
            .IsUnique();
        modelBuilder.Entity<UsersModel>()
            .HasIndex(u => u.Login)
            .HasDatabaseName("IX_Users_Login")
            .IsUnique();
        modelBuilder.Entity<UsersModel>()
            .HasIndex(u => u.TIN)
            .HasDatabaseName("IX_Users_TIN")
            .IsUnique();

        #endregion

        #region IX_Passports

        modelBuilder.Entity<PassportsModel>()
            .HasIndex(p => new { p.Series, p.Number })
            .HasDatabaseName("IX_Passports_SeriesAndNumber")
            .IsUnique();
        modelBuilder.Entity<PassportsModel>()
            .HasIndex(p => p.DateOfBirth)
            .HasDatabaseName("IX_Passports_DateOfBirthUser");
        modelBuilder.Entity<PassportsModel>()
            .HasIndex(p => p.PlaceOfBirth)
            .HasDatabaseName("IX_Passports_PlaceOfBirthUser");
        modelBuilder.Entity<PassportsModel>()
            .HasIndex(p => p.Gender)
            .HasDatabaseName("IX_Passports_GenderUser");

        #endregion

        #region IX_Snils

        modelBuilder.Entity<SnilsModel>()
            .HasIndex(s => s.Number)
            .HasDatabaseName("IX_Snils_Number")
            .IsUnique();

        #endregion

        #region IX_CurrencyRates

        modelBuilder.Entity<CurrencyRatesModel>()
            .HasIndex(cr => cr.LetterCode)
            .HasDatabaseName("IX_CurrencyRates_LetterCode");
        modelBuilder.Entity<CurrencyRatesModel>()
            .HasIndex(cr => cr.Rate)
            .HasDatabaseName("IX_CurrencyRates_Rate");
        modelBuilder.Entity<CurrencyRatesModel>()
            .HasIndex(cr => cr.DateReceipt)
            .HasDatabaseName("IX_CurrencyRates_DateReceipt");

        #endregion

        #region IX_WienerBoerseBonds

        modelBuilder.Entity<WienerBoerseBondsModel>()
            .HasIndex(b => b.Isin)
            .IsUnique()
            .HasDatabaseName("IX_WienerBoerseBonds_Isin");

        #endregion

        #region IX_LjubljanaStockExchangeBonds

        modelBuilder.Entity<LjubljanaStockExchangeBondsModel>()
            .HasIndex(b => b.Isin)
            .IsUnique()
            .HasDatabaseName("IX_LjubljanaStockExchangeBonds_Isin");

        #endregion

        #region IX_MoscowExchangeBonds

        modelBuilder.Entity<MoscowExchangeBondsModel>()
            .HasIndex(b => b.Isin)
            .IsUnique()
            .HasDatabaseName("IX_MoscowExchangeBonds_Isin");

        #endregion

        #region IX_SixGroupBonds

        modelBuilder.Entity<SixGroupBondsModel>()
            .HasIndex(b => b.Isin)
            .IsUnique()
            .HasDatabaseName("IX_SixGroupBondsModel_Isin");

        #endregion
    }
}