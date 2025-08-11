using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class DietPlanResponseDTO
    {
        public Guid Id { get; set; }
        public Guid CoachId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationInWeeks { get; set; }
        public List<DietMealDTO> MealTypes { get; set; } = new();
        public List<AssignedClientResponseDTO> Clients { get; set; } = new();

    }

    public class AssignedClientResponseDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public DateTime AssignedOn { get; set; }
    }

    public class DietMealDTO
    {
        public Guid Id { get; set; }
        public string MealType { get; set; } = string.Empty;
        public string MealName { get; set; } = string.Empty;
        public int Calories { get; set; }
        public int ProteinGrams { get; set; }
        public int CarbsGrams { get; set; }
        public int FatGrams { get; set; }
    }

}