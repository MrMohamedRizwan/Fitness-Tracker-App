using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models
{
    public class Progress
    {
        public Guid Id { get; set; }

        public Guid ClientId { get; set; }
        public Client? Client { get; set; }

        public string ImagePath { get; set; } = string.Empty;
        public float Height { get; set; }
        public float Weight { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}