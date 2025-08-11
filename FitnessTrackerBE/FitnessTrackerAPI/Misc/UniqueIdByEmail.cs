using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;

namespace FitnessTrackerAPI.Misc
{
    public class UniqueIdByEmail
    {
        private readonly IRepository<Guid, Coach> _coachRepository;

        private readonly IRepository<Guid, Client> _clientRepositroy;
        private readonly IRepository<Guid, Admin> _adminRepository;

        public UniqueIdByEmail(IRepository<Guid, Coach> coachRepository,
                                IRepository<Guid, Client> clientRepositroy,
                                IRepository<Guid, Admin> adminRepository)
        {
            _coachRepository = coachRepository;
            _clientRepositroy = clientRepositroy;
            _adminRepository = adminRepository;
        }
        public async Task<string> GetIdByEmail(User user)
        {
            if (user.Role == "Admin")
            {
                try
                {
                    var email = user.Email;
                    var Admin = (await _adminRepository.GetAll())
                               .FirstOrDefault(d => d.Email == email);
                    // System.Console.WriteLine(Admin.Id);
                    if (Admin == null)
                    {
                        // Console.WriteLine($"\n\nNo Admin found with email: {email}");
                        return "AdminisNull";
                    }
                    // Console.WriteLine($"\n\nGet Admin ID by email{Admin.Email} {Admin.Id}");

                    return Admin.Id.ToString();
                }
                catch (Exception e)
                {
                    // Console.WriteLine("\n\n  Error", e.Message);
                    return "Exception";

                }
                
            }
            if (user.Role == "Coach")
                {
                    try
                    {
                        var email = user.Email;
                        var coach = (await _coachRepository.GetAll())
                                   .FirstOrDefault(d => d.Email == email);
                        // System.Console.WriteLine(coach.Id);
                        if (coach == null)
                        {
                            // Console.WriteLine($"\n\nNo coach found with email: {email}");
                            return "coachisNull";
                        }
                        // Console.WriteLine($"\n\nGet coach ID by email{coach.Email} {coach.Id}");

                        return coach.Id.ToString();
                    }
                    catch (Exception e)
                    {
                        // Console.WriteLine("\n\n  Error", e.Message);
                        return "Exception";

                    }
                }
                else if (user.Role == "Client")
                {
                    try
                    {
                        var email = user.Email;
                        var client = (await _clientRepositroy.GetAll())
                                   .FirstOrDefault(d => d.Email == email);
                        // Console.WriteLine($"\n\nClient ID from Get uid by email{client.Id} " + client?.Id);
                        if (client == null)
                        {
                            Console.WriteLine($"\n\nNo client found with email: {email}❤️");
                            return "";

                        }
                        // Console.WriteLine($"\n\nGet client ID by email{client.Email} {client.Id}");
                        return client.Id.ToString();
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"\n\n  Error ❌ {e.InnerException?.Message ?? e.Message} ❌");
                        return "";
                    }
                }
            return "";
            
        }

        
    }
}