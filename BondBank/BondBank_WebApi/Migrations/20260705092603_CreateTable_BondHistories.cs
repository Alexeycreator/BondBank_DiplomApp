using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BondBank_WebApi.Migrations
{
    /// <inheritdoc />
    public partial class CreateTable_BondHistories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BondHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Isin = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    RecordedDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CurrencyRate = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    BondPrice = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    BondType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BondHistories", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BondHistories");
        }
    }
}
