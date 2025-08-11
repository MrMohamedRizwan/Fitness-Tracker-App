using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class UpdateStatusDTO
    {
        public Guid PlanAssignmentID { get; set; }
        public string status { get; set; } = string.Empty;
    }
}