using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class WorkoutCalories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "caloriesBurnt",
                table: "WorkoutExercise",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "caloriesBurnt",
                table: "Workout",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "caloriesTaken",
                table: "Workout",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "caloriesBurnt",
                table: "WorkoutExercise");

            migrationBuilder.DropColumn(
                name: "caloriesBurnt",
                table: "Workout");

            migrationBuilder.DropColumn(
                name: "caloriesTaken",
                table: "Workout");
        }
    }
}
