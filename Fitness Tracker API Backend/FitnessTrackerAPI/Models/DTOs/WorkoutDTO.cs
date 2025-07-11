using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class WorkoutCreateDTO
    {
        // [Required]
        // public DateTime Date { get; set; } = DateTime.UtcNow;

        // [Required(ErrorMessage = "Description is required.")]
        // [StringLength(200, ErrorMessage = "Description can't be longer than 200 characters.")]

        public int totalExercises { get; set; }
        public string DietMealJSON { get; set; } = string.Empty;

        [Required(ErrorMessage = "PlanAssignmentId is required.")]
        public Guid PlanAssignmentId { get; set; }
        public string ExercisesJSON { get; set; }
        public int caloriesBurnt { get; set; }
        public int caloriesTaken{ get; set; }
    }

    

    public class WorkoutResponseDTO
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public DateTime Date { get; set; }
        public string ExerciseJSON { get; set; } = string.Empty;
        public int totalExercises{ get; set; }
        public string DietMealJSON { get; set; } = string.Empty;
        public int caloriesBurnt { get; set; }
        public int caloriesTaken{ get; set; }

        public Guid? PlanAssignmentId { get; set; }
    }
}