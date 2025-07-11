using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Models.DTOs
{
    public class EncryptModel
    {
        public string Data { get; set; } = string.Empty;            // Plain text input
        public byte[]? EncryptedData { get; set; } 
    }
}