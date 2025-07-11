using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class workout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Workout");

            migrationBuilder.AddColumn<string>(
                name: "DietMealJSON",
                table: "Workout",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseJSON",
                table: "Workout",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "totalExercises",
                table: "Workout",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DietMealJSON",
                table: "Workout");

            migrationBuilder.DropColumn(
                name: "ExerciseJSON",
                table: "Workout");

            migrationBuilder.DropColumn(
                name: "totalExercises",
                table: "Workout");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Workout",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
