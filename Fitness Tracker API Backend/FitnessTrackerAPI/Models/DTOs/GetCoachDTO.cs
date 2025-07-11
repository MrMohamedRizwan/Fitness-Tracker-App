using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTO
{
    public class GetCoachDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float YearsOfExperience { get; set; }
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
    public class GetClientDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int Age { get; set; }

        public string Email { get; set; } = string.Empty;
        public  bool IsActive { get; set; } 
        
    }
}