using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using FirstAPI.Models.DTOs;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTO;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using Microsoft.AspNetCore.Components;

namespace FitnessTrackerAPI.Services
{
    public class ClientService : IClientService
    {
        private readonly IMapper _mapper;
        private readonly IRepository<string, User> _userRepository;
        private readonly IEncryptionService _encryptionService;
        private readonly IRepository<Guid, Client> _clientRepository;
        private readonly FitnessDBContext _context;
        private readonly IRepository<Guid, PlanAssignment> _planAssignmentRepository;
        private readonly IRepository<Guid, WorkoutPlan> _workoutPlanRepository;
        private readonly IRepository<Guid, DietPlan> _dietPlanRepository;
        private readonly IRepository<Guid, Workout> _workoutRepo;
        private readonly ITokenService _tokenService;



        public ClientService(IMapper mapper,
                            IEncryptionService encryptionService,
                            IRepository<string, User> userRepository,
                                IRepository<Guid, Client> clientRepository,
                                IRepository<Guid, PlanAssignment> planAssignmentRepository,
                                IRepository<Guid, WorkoutPlan> workoutPlanRepository,
                                IRepository<Guid, DietPlan> dietPlanRepository,
                                IRepository<Guid, Workout> workoutRepo,
                                ITokenService tokenService,
                                FitnessDBContext context)
        {
            _mapper = mapper;
            _tokenService = tokenService;
            _encryptionService = encryptionService;
            _userRepository = userRepository;
            _clientRepository = clientRepository;
            _planAssignmentRepository = planAssignmentRepository;
            _workoutPlanRepository = workoutPlanRepository;
            _dietPlanRepository = dietPlanRepository;
            _workoutRepo = workoutRepo;
            _context = context;

        }
        public async Task<PagedResult<GetClientDTO>> GetAllClientsAsync(int pageNumber, int pageSize)
        {
            var allCoaches = await _clientRepository.GetAll();
            var pagedCoaches = allCoaches
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            Func<IEnumerable<Client>, List<GetClientDTO>> mapToDto = clients =>
                clients.Select(c =>
                {
                    var user = _userRepository.Get(c.Email).Result;
                    return new GetClientDTO
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Age = c.Age,
                        Gender = c.Gender,
                        Email = c.Email,
                        IsActive = user?.IsActive ?? false
                    };
                }).ToList();
            var coachDtos = mapToDto(pagedCoaches);

            return new PagedResult<GetClientDTO>
            {
                Items = coachDtos,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalRecords = allCoaches.Count()
            };

        }
        public async Task<SignUpResponseDTO> AddCoach(ClientAddRequestDTO client)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingUser = await _userRepository.Get(client.Email);
                if (existingUser != null)
                    throw new Exception("User already exists");

                var user = _mapper.Map<ClientAddRequestDTO, User>(client);
                var encryptedData = await _encryptionService.EncryptData(new EncryptModel { Data = client.Password });
                user.Password = encryptedData.EncryptedData;
                user.Role = "Client";
                user.LastLoginAt = DateTime.UtcNow;
                user.IsActive = true;
                user.RefreshToken = string.Empty;

                try
                {
                    await _userRepository.Add(user);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Outer exception: ❤️ " + ex.Message);
                    Console.WriteLine("Inner exception: ❤️" + ex.InnerException?.Message);
                    throw;
                }


                var newClient = _mapper.Map<ClientAddRequestDTO, Client>(client);
                newClient.Email = user.Email;
                if (client.CoachId.HasValue)
                    newClient.CoachId = client.CoachId;




                await _userRepository.Update(user.Email, user); // persist token changes

                newClient = await _clientRepository.Add(newClient);
                if (newClient == null)
                    throw new Exception("Could not add Client");
                var accessToken = await _tokenService.GenerateToken(user);
                var refreshToken = _tokenService.GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userRepository.Update(user.Email, user); // persist token changes
                await transaction.CommitAsync();

                return new SignUpResponseDTO
                {
                    Id = newClient.Id,
                    Email = newClient.Email,
                    Token = accessToken,
                    RefreshToken = refreshToken,
                };
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync(); // Optional, for clarity
                Console.WriteLine($"{e.Message} ❌");
                throw;
            }
        }

        public async Task<List<AssignedPlanNamesDTO>> GetAssignedPlansForClient(ClaimsPrincipal user)
        {
            try
            {
                Console.WriteLine("\n\n------------\n\n");
                var clientIdClaim = user.FindFirst("UserId")?.Value;
                if (clientIdClaim == null || !Guid.TryParse(clientIdClaim, out Guid clientId))
                    throw new Exception("Invalid Client ID");

                var assignments = (await _planAssignmentRepository.GetAll())
                    .Where(a => a.ClientId == clientId)
                    .OrderByDescending(a => a.AssignedOn) // Order by AssignedOn descending
                    .ToList();

                var result = new List<AssignedPlanNamesDTO>();

                foreach (var assignment in assignments)
                {
                    var workoutPlan = assignment.WorkoutPlanId.HasValue
                        ? await _workoutPlanRepository.Get(assignment.WorkoutPlanId.Value)
                        : null;

                    var dietPlan = assignment.DietPlanId.HasValue
                        ? await _dietPlanRepository.Get(assignment.DietPlanId.Value)
                        : null;

                    result.Add(new AssignedPlanNamesDTO
                    {
                        PlanAssignmentId = assignment.Id,
                        progressPercentage=await CalculateWorkoutProgress(assignment.ClientId, assignment.Id),
                        WorkoutPlanTitle = workoutPlan?.Title ?? "Not Assigned",
                        WorkoutPlanID = workoutPlan?.Id,
                        DietPlanTitle = dietPlan?.Title ?? "Not Assigned",
                        DietPlanId = dietPlan?.Id,
                        status = assignment.CompletionStatus,
                        AssignedOn = assignment.AssignedOn,
                        DueDate = assignment.DueDate
                    });
                }

                return result;
            }
            catch (Exception e)
            {
                Console.WriteLine($"{e.Message} ❌");
                throw;
            }
        }
        public async Task<double> CalculateWorkoutProgress(Guid clientId, Guid planAssignmentId)
        {


            // Total days between AssignedOn and DueDate (duration of plan)
            var assignment = (await _planAssignmentRepository.GetAll())
                                        .FirstOrDefault(p => p.Id == planAssignmentId);
            if (assignment == null) return -12;

            var totalDays = (assignment.DueDate ?? DateTime.UtcNow).Date
                          .Subtract(assignment.AssignedOn.Date).Days + 1;

            // Count number of workout logs submitted for this plan
            var completedDays = (await _workoutRepo.GetAll())
                .Where(w => w.ClientId == clientId && w.PlanAssignmentId == planAssignmentId)
                .Select(w => w.Date.Date)
                .Distinct()
                .Count();
            Console.WriteLine("🎉🎉🎉🎉🎉" + completedDays);

            // Prevent division by zero
            if (totalDays <= 0) return 0;
            // totalDays = 1;
            double progress = (double)completedDays / totalDays * 100;
            return Math.Round(progress, 2); // Return as a percentage
        }

        public async Task<IEnumerable<Client>> GetClientById(Guid clientId)
        {
            var client = await _clientRepository.Get(clientId);
            if (client == null)
                throw new Exception("Client Not Found");

            return client != null ? new List<Client> { client } : new List<Client>();
        }
        public async Task<Client?> GetMyDetails(ClaimsPrincipal user)
        {
            var clientIdClaim = user.FindFirst("UserId")?.Value;
            if (clientIdClaim == null || !Guid.TryParse(clientIdClaim, out Guid clientId))
                throw new Exception("Invalid Client ID");

            return await _clientRepository.Get(clientId);
        }


        public async Task<string> UpdateClientDetails(ClaimsPrincipal user, ClientUpdateRequestDTO clientUpdate)
        {
            try
            {
                var clientIdClaim = user.FindFirst("UserId")?.Value;
                if (clientIdClaim == null || !Guid.TryParse(clientIdClaim, out Guid clientId))
                    throw new Exception("Invalid Client ID");
                Console.WriteLine($"Client ID{clientId}.  ❌");

                var client = await _clientRepository.Get(clientId);
                if (client == null)
                    throw new Exception("Client not found");

                // Update client details
                client.Gender = clientUpdate.Gender;
                client.Goal = clientUpdate.Goal;
                client.Height = clientUpdate.Height;
                client.Weight = clientUpdate.Weight;
                client.CoachId = clientUpdate.CoachId;

                await _clientRepository.Update(clientId, client);

                return "Client details updated successfully";
            }
            catch (Exception e)
            {
                Console.WriteLine($"{e.Message}  ❌");
                throw new Exception(e.Message);
            }
        }
        public async Task<bool> UpdatePlanStatus(Guid planAssignmentId, ClaimsPrincipal user,string status)
        {
                var clientIdClaim = user.FindFirst("UserId")?.Value;
                if (clientIdClaim == null || !Guid.TryParse(clientIdClaim, out Guid clientId))
                    throw new Exception("Invalid Client ID from token");
                var assignment = await _context.PlanAssignment.FindAsync(planAssignmentId);
                if (assignment == null)
                    throw new Exception("Plan assignment not found.");
                if (assignment.ClientId != clientId)
                throw new UnauthorizedAccessException("You are not authorized to update this plan.");
                if (status == "On Progress")
                    assignment.CompletionStatus = "On Progress";
                else if (status == "Cancelled")
                    assignment.CompletionStatus = "Cancelled";
                _context.PlanAssignment.Update(assignment);
                await _context.SaveChangesAsync();
                return true;
        }
    }
}