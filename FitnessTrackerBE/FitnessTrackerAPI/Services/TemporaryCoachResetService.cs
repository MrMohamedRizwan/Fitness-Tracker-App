using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;

namespace FitnessTrackerAPI.Services
{
    public class TemporaryCoachResetService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public TemporaryCoachResetService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var clientRepo = scope.ServiceProvider.GetRequiredService<IRepository<Guid, Client>>();
                    var clients = await clientRepo.GetAll();

                    var now = DateTime.UtcNow;

                    foreach (var client in clients)
                    {
                        if (client.TemporaryCoachEndDate.HasValue &&
                            client.TemporaryCoachEndDate.Value < now)
                        {
                            client.TemporaryCoachId = null;
                            client.TemporaryCoachStartDate = null;
                            client.TemporaryCoachEndDate = null;

                            await clientRepo.Update(client.Id, client);
                            Console.WriteLine($"🗑️ Cleared expired temp coach for client {client.Email}");
                        }
                    }
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // Run daily
            }
        }
    }
}