using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FirstAPI.Models.DTOs
{
    public class PlanAssignmentRequestDTO
    {
        [Required(ErrorMessage = "Client Email is required.")]
        public string? ClientEmail { get; set; }
        // [Required(ErrorMessage = "WorkoutName is required.")]

        public Guid? WorkoutPlanID { get; set; }
        // [Required(ErrorMessage = "Diet Name is required.")]

        public Guid? DietPlanID { get; set; }
        [Required(ErrorMessage = "Due Date is required.")]
        
        public DateTime DueDate { get; set; }
    }
}