using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class ClientUpdateRequestDTO
    {
        public string Gender { get; set; }
        public string Goal { get; set; }
        public float Height { get; set; }
        public float Weight { get; set; }
        public Guid CoachId { get; set; }
    }
}