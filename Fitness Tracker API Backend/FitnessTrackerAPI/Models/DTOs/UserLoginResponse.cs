using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class UserLoginResponse
    {
        public string Username { get; set; } = string.Empty;
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }

    }
}