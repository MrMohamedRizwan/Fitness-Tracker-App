using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class tempCoach : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "TemporaryCoachEndDate",
                table: "Client",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TemporaryCoachId",
                table: "Client",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TemporaryCoachStartDate",
                table: "Client",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TemporaryCoachEndDate",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "TemporaryCoachId",
                table: "Client");

            migrationBuilder.DropColumn(
                name: "TemporaryCoachStartDate",
                table: "Client");
        }
    }
}
