using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.WorkoutModel;

namespace FitnessTrackerAPI.Models
{
    public class Client
    {
        public Guid Id { get; set; }
        public Guid? CoachId { get; set; } // Nullable, in case client doesn't have a coach yet
        
        public string Gender { get; set; } = string.Empty;
        public float Height { get; set; } 
        public float Weight { get; set; }
        public string Goal { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public User? User { get; set; }
        public Coach? Coach { get; set; }
        public ICollection<Workout>? Workouts { get; set; }
        public ICollection<Progress>? Progress { get; set; }
        public ICollection<PlanAssignment>? PlanAssignments { get; set; }

    }
}