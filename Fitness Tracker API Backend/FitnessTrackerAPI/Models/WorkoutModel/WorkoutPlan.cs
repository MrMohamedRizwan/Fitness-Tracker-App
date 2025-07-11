using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.WorkoutModel;

namespace FitnessTrackerAPI.Models.WorkoutModel
{
    public class WorkoutPlan
    {
        public Guid Id { get; set; }
        public Guid CoachId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationInWeeks { get; set; }

        public Coach? Coach { get; set; }
        public ICollection<WorkoutExercise>? Exercises { get; set; }
        public ICollection<PlanAssignment>? Assignments { get; set; }
    }
}