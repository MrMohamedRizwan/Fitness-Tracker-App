using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Services
{
    public class EncryptionService : IEncryptionService
    {
        public  Task<EncryptModel> EncryptData(EncryptModel data)
        {
            string hash = BCrypt.Net.BCrypt.HashPassword(data.Data);
            data.EncryptedData = System.Text.Encoding.UTF8.GetBytes(hash);
            return  Task.FromResult(data);
        }
        public bool Verify(string plainText, byte[] encryptedBytes)
        {
            var hashed = System.Text.Encoding.UTF8.GetString(encryptedBytes);
            return BCrypt.Net.BCrypt.Verify(plainText, hashed);
        }
    }
}