using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class DietPlanCreateRequestDTO
    {
          [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(1, 52, ErrorMessage = "Duration must be between 1 and 52 weeks.")]
        public int DurationInWeeks { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one meal must be provided.")]
        public List<DietMealCreateDTO> Meals { get; set; } = new();
    }

    public class DietMealCreateDTO
    {
        [Required]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Meal type must be between 2 and 50 characters.")]
        public string MealType { get; set; } = string.Empty; // e.g., Breakfast, Lunch

        [Required]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "MealName must be between 2 and 200 characters.")]
        public string MealName { get; set; } = string.Empty;

        [Range(0, 10000, ErrorMessage = "Calories must be between 0 and 10,000.")]
        public int Calories { get; set; }

        [Range(0, 1000, ErrorMessage = "Protein grams must be between 0 and 1,000.")]
        public int ProteinGrams { get; set; }

        [Range(0, 1000, ErrorMessage = "Carbs grams must be between 0 and 1,000.")]
        public int CarbsGrams { get; set; }

        [Range(0, 1000, ErrorMessage = "Fat grams must be between 0 and 1,000.")]
        public int FatGrams { get; set; }
    }
}