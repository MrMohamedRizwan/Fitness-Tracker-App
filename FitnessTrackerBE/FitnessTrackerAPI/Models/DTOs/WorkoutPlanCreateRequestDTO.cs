using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class WorkoutPlanCreateRequestDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(1, 52, ErrorMessage = "Duration must be between 1 and 52 weeks.")]
        public int DurationInWeeks { get; set; }

        [MinLength(1, ErrorMessage = "At least one exercise is required.")]
        public List<WorkoutExerciseCreateDTO> Exercises { get; set; } = new();
    }

    public class WorkoutExerciseCreateDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        public int caloriesBurnt{ get; set; }

        [Range(1, 20, ErrorMessage = "Sets must be between 1 and 20.")]
        public int Sets { get; set; }

        [Range(1, 100, ErrorMessage = "Reps must be between 1 and 100.")]
        public int Reps { get; set; }

        [Range(0, 600, ErrorMessage = "RestSeconds must be between 0 and 600.")]
        public int RestSeconds { get; set; }

        [StringLength(200)]
        public string Notes { get; set; } = string.Empty;
    }
}