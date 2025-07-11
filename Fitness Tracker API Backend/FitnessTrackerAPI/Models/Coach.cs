using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.WorkoutModel;

namespace FitnessTrackerAPI.Models
{
    public class Coach
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = string.Empty;
        public float YearsOfExperience { get; set; }

        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public User? User { get; set; }
        public ICollection<Client>? Clients { get; set; }

        public ICollection<WorkoutPlan>? WorkoutPlans { get; set; }
        public ICollection<DietPlan>? DietPlans { get; set; }
        public ICollection<PlanAssignment>? AssignedPlans { get; set; } 
    }
}