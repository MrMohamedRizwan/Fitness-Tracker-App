using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class ForgotPasswordreqDTO
    {
        public string Email { get; set; }=string.Empty;
        // public string Otp { get; set; }
        // public string NewPassword { get; set; }
    }
}