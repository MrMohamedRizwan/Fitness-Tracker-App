using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models
{
    public class User
    {
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public byte[]? Password { get; set; }
        public string RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public byte[]? HashKey { get; set; }
        public Coach? Coach { get; set; }
        public Client? Client { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;

    }

}