using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace FitnessTrackerAPI.Models.WorkoutModel
{
    public class Workout
    {

        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Client? Client { get; set; } = null!;
        
        public DateTime Date { get; set; }
        public string ExerciseJSON { get; set; } = string.Empty;
        public int totalExercises{ get; set; }
        public string DietMealJSON { get; set; } = string.Empty;
        public int caloriesBurnt { get; set; }
        public int caloriesTaken{ get; set; }
        public Guid? PlanAssignmentId { get; set; }
        public PlanAssignment? PlanAssignment { get; set; }
        
    }
}