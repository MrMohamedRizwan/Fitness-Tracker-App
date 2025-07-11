using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class TokenRefreshRequest
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }

    }
}