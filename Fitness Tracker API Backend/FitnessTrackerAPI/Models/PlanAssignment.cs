using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.WorkoutModel;
using Microsoft.VisualBasic;

namespace FitnessTrackerAPI.Models
{
    public class PlanAssignment
    {

        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid? WorkoutPlanId { get; set; }
        public Guid? DietPlanId { get; set; }
        public Guid AssignedByCoachId { get; set; }
        public string CompletionStatus { get; set; } = "Not Completed";
        public DateTime AssignedOn { get; set; } = DateTime.UtcNow;
        public Client? Client { get; set; }
        public WorkoutPlan? WorkoutPlan { get; set; }
        public DietPlan? DietPlan { get; set; }
        public Coach? AssignedByCoach { get; set; }
        public DateTime? DueDate{ get; set; }
    }

}