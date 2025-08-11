using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class AssignSubCoachDTO
    {
        public Guid ClientId { get; set; }
       public  Guid SubCoachId { get; set; }
       public  DateTime StartDate { get; set; }
       public  DateTime EndDate { get; set; } 
    }
}