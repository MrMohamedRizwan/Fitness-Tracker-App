using System;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using FitnessTrackerAPI.Interfaces;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using System.Net;
using FitnessTrackerAPI.Models;

namespace FitnessTrackerAPI.Services
{
    public class UserActivityChecker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public UserActivityChecker(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var userRepo = scope.ServiceProvider.GetRequiredService<IRepository<string, User>>();
                    var users = await userRepo.GetAll();

                    var now = DateTime.UtcNow;

                    foreach (var user in users)
                    {
                        if (user.IsActive && (now - user.LastLoginAt).TotalDays > 30)
                        {
                            user.IsActive = false;
                            await userRepo.Update(user.Email,user);
                            Console.WriteLine($"⛔ User {user.Email} marked as inactive");
                        }
                    }
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // Run daily
            }
        }
    }
}