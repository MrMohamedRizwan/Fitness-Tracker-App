using Amazon.Runtime;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Services
{
    public class OtpService : IOtpService
    {
        private readonly Dictionary<string, (string otp, DateTime expiry)> _otpStore = new();
        private readonly IAmazonSimpleEmailService _sesClient;

        public OtpService(IAmazonSimpleEmailService sesClient)
        {
            _sesClient = sesClient;
        }

        public async Task SendOtpAsync(string email)
        {
            Console.WriteLine($"Sending OTP to {email}...");

            var otp = new Random().Next(100000, 999999).ToString();
            _otpStore[email] = (otp, DateTime.UtcNow.AddMinutes(5));

            var fromEmail = "";
            var fromPassword = ""; 

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = "OTP for Password Reset",
                Body = $"Your OTP is: {otp}",
                IsBodyHtml = false,
            };

            message.To.Add(email);

            using var smtp = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(fromEmail, fromPassword),
                EnableSsl = true
            };

            await smtp.SendMailAsync(message);
        }


        public Task<bool> VerifyOtpAsync(string email, string otp)
        {
            if (_otpStore.TryGetValue(email, out var record))
            {
                var (storedOtp, expiry) = record;
                if (DateTime.UtcNow <= expiry && storedOtp == otp)
                    return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
    }

}