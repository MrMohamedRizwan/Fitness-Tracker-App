using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class WorkoutPlanResponseDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationInWeeks { get; set; }
        public Guid CoachId { get; set; }
        public List<AssignedClientsResponseDTO> Clients { get; set; } = new();

        public List<WorkoutExerciseResponseDTO> Exercises { get; set; } = new();
    }

    public class AssignedClientsResponseDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public DateTime AssignedOn { get; set; }
    }

    public class WorkoutExerciseResponseDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int caloriesBurnt { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int RestSeconds { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}