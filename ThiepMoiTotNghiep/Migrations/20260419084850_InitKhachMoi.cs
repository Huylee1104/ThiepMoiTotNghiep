using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ThiepMoiTotNghiep.Migrations
{
    /// <inheritdoc />
    public partial class InitKhachMoi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "KhachMois",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenKhachMoi = table.Column<string>(type: "text", nullable: true),
                    AnhBase64 = table.Column<string>(type: "text", nullable: true),
                    SoLuotGheTham = table.Column<int>(type: "integer", nullable: true),
                    SoLuotIn = table.Column<int>(type: "integer", nullable: true),
                    ThamGia = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhachMois", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KhachMois");
        }
    }
}
