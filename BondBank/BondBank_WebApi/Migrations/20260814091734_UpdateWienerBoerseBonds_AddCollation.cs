using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BondBank_WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWienerBoerseBonds_AddCollation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WienerBoerseBonds_Isin",
                table: "WienerBoerseBonds");

            migrationBuilder.CreateIndex(
                name: "IX_WienerBoerseBonds_Isin",
                table: "WienerBoerseBonds",
                column: "Isin",
                unique: true)
                .Annotation("Relational:Collation", new[] { "C" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WienerBoerseBonds_Isin",
                table: "WienerBoerseBonds");

            migrationBuilder.CreateIndex(
                name: "IX_WienerBoerseBonds_Isin",
                table: "WienerBoerseBonds",
                column: "Isin",
                unique: true);
        }
    }
}
