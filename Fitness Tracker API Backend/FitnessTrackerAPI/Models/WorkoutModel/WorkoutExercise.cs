using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.WorkoutModel;

namespace FitnessTrackerAPI.Models.WorkoutModel
{
    public class WorkoutExercise
    {
        public Guid Id { get; set; }
        public Guid WorkoutPlanId { get; set; }

        public string Name { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int RestSeconds { get; set; }
        public int caloriesBurnt{ get; set; }
        public string Notes { get; set; } = string.Empty;

        public WorkoutPlan? WorkoutPlan { get; set; }
    }
}