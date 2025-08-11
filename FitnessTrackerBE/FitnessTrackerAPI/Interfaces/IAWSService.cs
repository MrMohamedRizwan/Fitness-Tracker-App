using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IAWSService
    {
        Task<string> UploadFileAsync(IFormFile file, string folderName);
        public string GeneratePreSignedURL(string key, int expiryMinutes);
        // Task SendEmailAsync(string toAddress, string subject, string bodyText);
    }
}