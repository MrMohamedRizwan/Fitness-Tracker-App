using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FirstAPI.Models.DTOs
{
    public class AssignedPlanNamesDTO
    {
        public Guid? PlanAssignmentId { get; set; }
        public string? WorkoutPlanTitle { get; set; }
        public Guid? WorkoutPlanID { get; set; }

        public string? DietPlanTitle { get; set; }
        public Guid? DietPlanId { get; set; }
        public string? status { get; set; }
        public DateTime AssignedOn { get; set; }
        public DateTime? DueDate { get; set; }
        public double progressPercentage {get;set;}
        
    }
}