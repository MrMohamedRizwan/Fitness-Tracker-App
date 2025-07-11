using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IEncryptionService
    {
        public Task<EncryptModel> EncryptData(EncryptModel data);
        bool Verify(string plainText, byte[] encryptedBytes);
        
    }
}