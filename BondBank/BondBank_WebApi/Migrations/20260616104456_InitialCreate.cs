using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BondBank_WebApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CurrencyRates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DigitalCode = table.Column<int>(type: "integer", nullable: false),
                    LetterCode = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Units = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Rate = table.Column<double>(type: "numeric(18,4)", nullable: false),
                    DateReceipt = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurrencyRates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Passports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Series = table.Column<int>(type: "integer", maxLength: 4, nullable: false),
                    Number = table.Column<int>(type: "integer", maxLength: 6, nullable: false),
                    IssuedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DateOfIssue = table.Column<DateOnly>(type: "date", nullable: false),
                    DepartmentCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<int>(type: "integer", nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    PlaceOfBirth = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Passports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Snils",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Number = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    RegistrationDate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Snils", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SecondName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SurName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmailAddress = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    TIN = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    Login = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RefreshToken = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    LockoutEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PassportId = table.Column<int>(type: "integer", nullable: false),
                    SnilsId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Passports_PassportId",
                        column: x => x.PassportId,
                        principalTable: "Passports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_Snils_SnilsId",
                        column: x => x.SnilsId,
                        principalTable: "Snils",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Portfolio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Portfolio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Portfolio_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoryPortfolio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateSavePortfolioUser = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Details = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    UsersId = table.Column<int>(type: "integer", nullable: false),
                    PortfoliosId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoryPortfolio", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoryPortfolio_Portfolio_PortfoliosId",
                        column: x => x.PortfoliosId,
                        principalTable: "Portfolio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoryPortfolio_Users_UsersId",
                        column: x => x.UsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LjubljanaStockExchangeBonds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Sector = table.Column<char>(type: "character(1)", nullable: false),
                    ListedQuantity = table.Column<long>(type: "bigint", nullable: false),
                    NominalValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ListingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DelistingDate = table.Column<DateOnly>(type: "date", nullable: true),
                    PortfoliosId = table.Column<int>(type: "integer", nullable: true),
                    CurrencyRatesId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Isin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LjubljanaStockExchangeBonds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LjubljanaStockExchangeBonds_CurrencyRates_CurrencyRatesId",
                        column: x => x.CurrencyRatesId,
                        principalTable: "CurrencyRates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LjubljanaStockExchangeBonds_Portfolio_PortfoliosId",
                        column: x => x.PortfoliosId,
                        principalTable: "Portfolio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MoscowExchangeBonds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SecurityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SecurityTypeId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SecId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ShortName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RegNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsTraded = table.Column<bool>(type: "boolean", nullable: false),
                    PrimaryBoardId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Market = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Engine = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    FaceValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    FaceUnit = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PortfoliosId = table.Column<int>(type: "integer", nullable: true),
                    CurrencyRatesId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Isin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoscowExchangeBonds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoscowExchangeBonds_CurrencyRates_CurrencyRatesId",
                        column: x => x.CurrencyRatesId,
                        principalTable: "CurrencyRates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MoscowExchangeBonds_Portfolio_PortfoliosId",
                        column: x => x.PortfoliosId,
                        principalTable: "Portfolio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SixGroupBonds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ValorId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TradingBaseCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CouponRate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    MaturityDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ClosingPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ClosingPerfomance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BidPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AskPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MarketTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    MarketDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IssuerNameFull = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProductLine = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IndustrySectorCode = table.Column<int>(type: "integer", nullable: false),
                    SecTypeCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    AmountInIssue = table.Column<long>(type: "bigint", nullable: false),
                    YieldToWorst = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    PortfoliosId = table.Column<int>(type: "integer", nullable: true),
                    CurrencyRatesId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Isin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SixGroupBonds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SixGroupBonds_CurrencyRates_CurrencyRatesId",
                        column: x => x.CurrencyRatesId,
                        principalTable: "CurrencyRates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SixGroupBonds_Portfolio_PortfoliosId",
                        column: x => x.PortfoliosId,
                        principalTable: "Portfolio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WienerBoerseBonds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Last = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    Chg = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Bid = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Ask = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Maturity = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<char>(type: "character(1)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PortfoliosId = table.Column<int>(type: "integer", nullable: true),
                    CurrencyRatesId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Isin = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WienerBoerseBonds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WienerBoerseBonds_CurrencyRates_CurrencyRatesId",
                        column: x => x.CurrencyRatesId,
                        principalTable: "CurrencyRates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WienerBoerseBonds_Portfolio_PortfoliosId",
                        column: x => x.PortfoliosId,
                        principalTable: "Portfolio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyRates_DateReceipt",
                table: "CurrencyRates",
                column: "DateReceipt");

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyRates_LetterCode",
                table: "CurrencyRates",
                column: "LetterCode");

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyRates_Rate",
                table: "CurrencyRates",
                column: "Rate");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryPortfolio_PortfoliosId",
                table: "HistoryPortfolio",
                column: "PortfoliosId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoryPortfolio_UsersId",
                table: "HistoryPortfolio",
                column: "UsersId");

            migrationBuilder.CreateIndex(
                name: "IX_LjubljanaStockExchangeBonds_CurrencyRatesId",
                table: "LjubljanaStockExchangeBonds",
                column: "CurrencyRatesId");

            migrationBuilder.CreateIndex(
                name: "IX_LjubljanaStockExchangeBonds_Isin",
                table: "LjubljanaStockExchangeBonds",
                column: "Isin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LjubljanaStockExchangeBonds_PortfoliosId",
                table: "LjubljanaStockExchangeBonds",
                column: "PortfoliosId");

            migrationBuilder.CreateIndex(
                name: "IX_MoscowExchangeBonds_CurrencyRatesId",
                table: "MoscowExchangeBonds",
                column: "CurrencyRatesId");

            migrationBuilder.CreateIndex(
                name: "IX_MoscowExchangeBonds_Isin",
                table: "MoscowExchangeBonds",
                column: "Isin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MoscowExchangeBonds_PortfoliosId",
                table: "MoscowExchangeBonds",
                column: "PortfoliosId");

            migrationBuilder.CreateIndex(
                name: "IX_Passports_DateOfBirthUser",
                table: "Passports",
                column: "DateOfBirth");

            migrationBuilder.CreateIndex(
                name: "IX_Passports_GenderUser",
                table: "Passports",
                column: "Gender");

            migrationBuilder.CreateIndex(
                name: "IX_Passports_PlaceOfBirthUser",
                table: "Passports",
                column: "PlaceOfBirth");

            migrationBuilder.CreateIndex(
                name: "IX_Passports_SeriesAndNumber",
                table: "Passports",
                columns: new[] { "Series", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Portfolio_UserId",
                table: "Portfolio",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SixGroupBonds_CurrencyRatesId",
                table: "SixGroupBonds",
                column: "CurrencyRatesId");

            migrationBuilder.CreateIndex(
                name: "IX_SixGroupBonds_PortfoliosId",
                table: "SixGroupBonds",
                column: "PortfoliosId");

            migrationBuilder.CreateIndex(
                name: "IX_SixGroupBondsModel_Isin",
                table: "SixGroupBonds",
                column: "Isin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Snils_Number",
                table: "Snils",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_EmailAddress",
                table: "Users",
                column: "EmailAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_FullName",
                table: "Users",
                columns: new[] { "SecondName", "FirstName", "SurName" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Login",
                table: "Users",
                column: "Login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PassportId",
                table: "Users",
                column: "PassportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users",
                column: "PhoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_SnilsId",
                table: "Users",
                column: "SnilsId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TIN",
                table: "Users",
                column: "TIN",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WienerBoerseBonds_CurrencyRatesId",
                table: "WienerBoerseBonds",
                column: "CurrencyRatesId");

            migrationBuilder.CreateIndex(
                name: "IX_WienerBoerseBonds_Isin",
                table: "WienerBoerseBonds",
                column: "Isin",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WienerBoerseBonds_PortfoliosId",
                table: "WienerBoerseBonds",
                column: "PortfoliosId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistoryPortfolio");

            migrationBuilder.DropTable(
                name: "LjubljanaStockExchangeBonds");

            migrationBuilder.DropTable(
                name: "MoscowExchangeBonds");

            migrationBuilder.DropTable(
                name: "SixGroupBonds");

            migrationBuilder.DropTable(
                name: "WienerBoerseBonds");

            migrationBuilder.DropTable(
                name: "CurrencyRates");

            migrationBuilder.DropTable(
                name: "Portfolio");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Passports");

            migrationBuilder.DropTable(
                name: "Snils");
        }
    }
}
