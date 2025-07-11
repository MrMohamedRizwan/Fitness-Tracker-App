using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class diet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DietTitle",
                table: "DietPlans",
                newName: "Title");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "DietPlans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DurationInWeeks",
                table: "DietPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "DietPlans");

            migrationBuilder.DropColumn(
                name: "DurationInWeeks",
                table: "DietPlans");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "DietPlans",
                newName: "DietTitle");
        }
    }
}
