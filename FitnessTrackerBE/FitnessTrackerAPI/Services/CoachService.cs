using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using AutoMapper;
using FirstAPI.Models.DTOs;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Repository;
using FitnessTrackerAPI.Services.Hubs;
using FitnessTrackerAPI.Models.DTO;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System.Globalization;

namespace FitnessTrackerAPI.Services
{
    public class CoachService : ICoachService
    {
        private readonly IMapper _mapper;
        private readonly IRepository<string, User> _userRepository;
        private readonly IEncryptionService _encryptionService;
        private readonly IRepository<Guid, Coach> _coachRepository;
        private readonly FitnessDBContext _context;
        private readonly IRepository<Guid, DietMeal> _dietMealRepository;
        private readonly IRepository<Guid, DietPlan> _dietPlanRepository;
        private readonly IRepository<Guid, WorkoutPlan> _workoutPlanRepository;
        private readonly IRepository<Guid, WorkoutExercise> _workoutExerciseRepository;

        private readonly IRepository<Guid, PlanAssignment> _planAssignmentRepository;
        private readonly IRepository<Guid, Client> _clientRepository;
        private readonly IRepository<Guid, Workout> _workoutLogRepo;

        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ITokenService _tokenService;






        public CoachService(IMapper mapper,
                            IEncryptionService encryptionService,
                            IRepository<string, User> userRepository,
                            IRepository<Guid, Coach> coachRepository,
                            IRepository<Guid, DietMeal> dietMealRepository,
                            IRepository<Guid, DietPlan> dietPlanRepository,
                            IRepository<Guid, WorkoutPlan> workoutPlanRepository,
                            IRepository<Guid, WorkoutExercise> workoutExerciseRepository,
                            FitnessDBContext context,
                            IRepository<Guid, Workout> workoutLogRepo,
                             IRepository<Guid, PlanAssignment> planAssignmentRepository,
                              IRepository<Guid, Client> clientRepository,
                              IHubContext<NotificationHub> hubContext,
                              ITokenService tokenService
                            )
        {
            _mapper = mapper;
            _encryptionService = encryptionService;
            _userRepository = userRepository;
            _coachRepository = coachRepository;
            _dietMealRepository = dietMealRepository;
            _dietPlanRepository = dietPlanRepository;
            _workoutPlanRepository = workoutPlanRepository;
            _workoutExerciseRepository = workoutExerciseRepository;
            _planAssignmentRepository = planAssignmentRepository;
            _clientRepository = clientRepository;
            _hubContext = hubContext;
            _context = context;
            _tokenService = tokenService;
            _workoutLogRepo = workoutLogRepo;
        }

        public async Task<SignUpResponseDTO> AddCoach(CoachAddRequestDTO coach)
        {
            // using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // System.Console.WriteLine("Before DB 😒");

                var user = _mapper.Map<CoachAddRequestDTO, User>(coach);
                var existingUser = await _userRepository.Get(coach.Email);
                if (existingUser != null)
                    throw new Exception("User Already Exist");

                var encryptedData = await _encryptionService.EncryptData(new EncryptModel
                {
                    Data = coach.Password
                });

                user.Password = encryptedData.EncryptedData;
                user.Role = "Coach";
                user.RefreshToken = "null";
                user.LastLoginAt = DateTime.UtcNow;
                user.IsActive = true;
                user = await _userRepository.Add(user);

                var newCoach = _mapper.Map<CoachAddRequestDTO, Coach>(coach);
                newCoach.Email = user.Email;


                newCoach = await _coachRepository.Add(newCoach);
                if (newCoach == null)
                    throw new Exception("Could not add Coach");
                var accessToken = await _tokenService.GenerateToken(user);
                var refreshToken = _tokenService.GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                user.LastLoginAt = DateTime.UtcNow;
                user.IsActive = true;
                await _userRepository.Update(user.Email, user); // persist token changes
                // await transaction.CommitAsync();
                return new SignUpResponseDTO
                {
                    Id = newCoach.Id,
                    Email = newCoach.Email,
                    Token = accessToken,
                    RefreshToken = refreshToken

                };
            }
            catch (Exception e)
            {
                // await transaction.RollbackAsync();
                Console.WriteLine($"Error ❌ {e.Message}");
                if (e.InnerException != null)
                    Console.WriteLine($"Inner Exception 💥 {e.InnerException.Message}");
                throw new Exception(e.Message);
            }
        }


        // public async Task<DietPlan> AddMeal(DietPlanCreateRequestDTO diet, ClaimsPrincipal user)
        // {

        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");
        //     var existingPlans = await _dietPlanRepository.GetAll();
        //     if (existingPlans.Any(p => p.CoachId == coachId && p.DietTitle.ToLower() == diet.DietTitle.ToLower()))
        //     {
        //         throw new Exception("A diet plan with this title already exists. Choose a new title or edit the previous diet plan");
        //     }
        //     using var transaction = await _context.Database.BeginTransactionAsync();
        //     try
        //     {
        //         var dietPlan = _mapper.Map<DietPlan>(diet);
        //         dietPlan.Id = Guid.NewGuid();
        //         dietPlan.CoachId = coachId;

        //         dietPlan = await _dietPlanRepository.Add(dietPlan);

        //         var meals = diet.Meals.Select(mealDto =>
        //         {
        //             var meal = _mapper.Map<DietMeal>(mealDto);
        //             meal.Id = Guid.NewGuid();
        //             meal.DietPlanId = dietPlan.Id;
        //             return meal;
        //         }).ToList();

        //         foreach (var meal in meals)
        //         {
        //             await _dietMealRepository.Add(meal);
        //         }

        //         await transaction.CommitAsync();
        //         dietPlan.Meals = meals;
        //         return dietPlan;
        //     }
        //     catch (Exception e)
        //     {
        //         await transaction.RollbackAsync();
        //         throw new Exception(e.Message);
        //     }
        // }
        // public async Task<DietPlan> UpdateDietPlanByTitle(string title, DietPlanCreateRequestDTO dto, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");

        //     var normalizedTitle = title.Trim().ToLower();

        //     var dietPlans = await _dietPlanRepository.GetAll();
        //     var existingDietPlan = dietPlans.FirstOrDefault(dp =>
        //         dp.CoachId == coachId &&
        //         dp.DietTitle.Trim().ToLower() == normalizedTitle
        //     );

        //     if (existingDietPlan == null)
        //         throw new Exception("Diet plan not found or unauthorized access");

        //     // // Check for duplicate title (excluding the current one)
        //     // var duplicateTitle = dietPlans.Any(dp =>
        //     //     dp.CoachId == coachId &&
        //     //     dp.Id != existingDietPlan.Id &&
        //     //     dp.DietTitle.Trim().ToLower() == dto.DietTitle.Trim().ToLower());

        //     // if (duplicateTitle)
        //     //     throw new Exception("A diet plan with this title already exists");

        //     using var transaction = await _context.Database.BeginTransactionAsync();

        //     try
        //     {
        //         // Update diet title
        //         existingDietPlan.DietTitle = dto.DietTitle.Trim();

        //         // Delete existing meals
        //         var existingMeals = (await _dietMealRepository.GetAll())
        //             .Where(m => m.DietPlanId == existingDietPlan.Id)
        //             .ToList();

        //         foreach (var meal in existingMeals)
        //             await _dietMealRepository.Delete(meal.Id);

        //         // Add new meals
        //         var newMeals = dto.Meals.Select(mealDto =>
        //         {
        //             var meal = _mapper.Map<DietMeal>(mealDto);
        //             meal.Id = Guid.NewGuid();
        //             meal.DietPlanId = existingDietPlan.Id;
        //             return meal;
        //         }).ToList();

        //         foreach (var meal in newMeals)
        //             await _dietMealRepository.Add(meal);

        //         await transaction.CommitAsync();

        //         existingDietPlan.Meals = newMeals;
        //         return existingDietPlan;
        //     }
        //     catch
        //     {
        //         await transaction.RollbackAsync();
        //         throw;
        //     }

        // }

        // public async Task<bool> DeleteDietPlanByTitle(string title, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");

        //     var normalizedTitle = title.Trim().ToLower();

        //     var allPlans = await _dietPlanRepository.GetAll();
        //     var dietPlan = allPlans.FirstOrDefault(dp =>
        //         dp.CoachId == coachId &&
        //         dp.DietTitle.Trim().ToLower() == normalizedTitle);

        //     if (dietPlan == null)
        //         throw new Exception("Diet plan not found or unauthorized access");

        //     using var transaction = await _context.Database.BeginTransactionAsync();

        //     try
        //     {
        //         // Delete all associated meals
        //         var meals = (await _dietMealRepository.GetAll())
        //             .Where(m => m.DietPlanId == dietPlan.Id)
        //             .ToList();

        //         foreach (var meal in meals)
        //             await _dietMealRepository.Delete(meal.Id);

        //         // Delete the diet plan
        //         await _dietPlanRepository.Delete(dietPlan.Id);

        //         await transaction.CommitAsync();
        //         return true;
        //     }
        //     catch
        //     {
        //         await transaction.RollbackAsync();
        //         throw;
        //     }
        // }

        // public async Task<List<DietPlanResponseDTO>> GetAllDietPlansDTO(ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");

        //     var allPlans = await _dietPlanRepository.GetAll();
        //     var coachPlans = allPlans.Where(p => p.CoachId == coachId).ToList();

        //     var allMeals = await _dietMealRepository.GetAll();
        //     var mealGroups = allMeals
        //                      .Where(m => coachPlans.Select(p => p.Id).Contains(m.DietPlanId))
        //                      .GroupBy(m => m.DietPlanId)
        //                      .ToDictionary(g => g.Key, g => g.ToList());

        //     var result = coachPlans.Select(p => new DietPlanResponseDTO
        //     {
        //         DietTitle = p.DietTitle,
        //         MealTypes = mealGroups.ContainsKey(p.Id)
        //             ? mealGroups[p.Id].Select(m => new DietMealDTO
        //             {
        //                 MealType = m.MealType,
        //                 Description = m.Description,
        //                 Calories = m.Calories,
        //                 ProteinGrams = m.ProteinGrams,
        //                 CarbsGrams = m.CarbsGrams,
        //                 FatGrams = m.FatGrams
        //             }).ToList()
        //             : new List<DietMealDTO>()
        //     }).ToList();
        //     return result;
        // }
        // public async Task<DietPlanResponseDTO?> GetDietPlanByTitle(string title, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID");

        //     var plans = await _dietPlanRepository.GetAll();
        //     var plan = plans
        //                 .Where(p => p.CoachId == coachId)
        //                 .FirstOrDefault(p => p.DietTitle.Equals(title.Trim(), StringComparison.OrdinalIgnoreCase));

        //     if (plan == null)
        //         return null;

        //     var meals = (await _dietMealRepository.GetAll())
        //                     .Where(m => m.DietPlanId == plan.Id)
        //                     .ToList();

        //     return new DietPlanResponseDTO
        //     {
        //         DietTitle = plan.DietTitle,
        //         MealTypes = meals.Select(m => new DietMealDTO
        //         {
        //             MealType = m.MealType,
        //             Description = m.Description,
        //             Calories = m.Calories,
        //             ProteinGrams = m.ProteinGrams,
        //             CarbsGrams = m.CarbsGrams,
        //             FatGrams = m.FatGrams
        //         }).ToList()
        //     };
        // }













        // public async Task<WorkoutPlan> AddWorkoutPlan(WorkoutPlanCreateRequestDTO workout, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");
        //     var existingPlans = await _workoutPlanRepository.GetAll();
        //     if (existingPlans.Any(p => p.CoachId == coachId && p.Title.ToLower() == workout.Title.ToLower()))
        //     {
        //         throw new Exception("A workout plan with this title already exists. Choose a new title or edit the previous workout plan");
        //     }
        //     using var transaction = await _context.Database.BeginTransactionAsync();
        //     try
        //     {
        //         var workoutPlan = _mapper.Map<WorkoutPlan>(workout);
        //         workoutPlan.Id = Guid.NewGuid();
        //         workoutPlan.CoachId = coachId;
        //         workoutPlan = await _workoutPlanRepository.Add(workoutPlan);

        //         var exercise = workout.Exercises.Select(workoutDto =>
        //         {
        //             var exe = _mapper.Map<WorkoutExercise>(workoutDto);
        //             exe.Id = Guid.NewGuid();
        //             exe.WorkoutPlanId = workoutPlan.Id;
        //             return exe;
        //         }).ToList();

        //         foreach (var x in exercise)
        //             await _workoutExerciseRepository.Add(x);

        //         await transaction.CommitAsync();
        //         workoutPlan.Exercises = exercise;
        //         return workoutPlan;
        //     }
        //     catch (Exception e)
        //     {
        //         await transaction.RollbackAsync();
        //         throw new Exception(e.Message);
        //     }

        // }

        // public async Task<WorkoutPlan> UpdateWorkoutPlanByTitle(string title, WorkoutPlanCreateRequestDTO dto, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");

        //     var normalizedTitle = title.Trim().ToLower();
        //     var workoutPlans = await _workoutPlanRepository.GetAll();
        //     var existingWorkoutPlan = workoutPlans.FirstOrDefault(dp =>
        //         dp.CoachId == coachId &&
        //         dp.Title.Trim().ToLower() == normalizedTitle
        //     );

        //     if (existingWorkoutPlan == null)
        //         throw new Exception("Workout plan not found or unauthorized access");

        //     using var transaction = await _context.Database.BeginTransactionAsync();

        //     try
        //     {
        //         existingWorkoutPlan.Title = dto.Title.Trim();
        //         existingWorkoutPlan.Title = dto.Title;
        //         existingWorkoutPlan.Description = dto.Description;
        //         existingWorkoutPlan.DurationInWeeks = dto.DurationInWeeks;
        //         var existingWorkout = (await _workoutExerciseRepository.GetAll())
        //                             .Where(m => m.WorkoutPlanId == existingWorkoutPlan.Id).ToList();
        //         foreach (var workout in existingWorkout)
        //         {
        //             await _workoutExerciseRepository.Delete(workout.Id);
        //         }

        //         var newExercice = dto.Exercises.Select(exerciseDto =>
        //         {
        //             var ex = _mapper.Map<WorkoutExercise>(exerciseDto);
        //             ex.Id = Guid.NewGuid();
        //             ex.WorkoutPlanId = existingWorkoutPlan.Id;
        //             return ex;
        //         }).ToList();

        //         foreach (var ex in newExercice)
        //             await _workoutExerciseRepository.Add(ex);

        //         await transaction.CommitAsync();

        //         existingWorkoutPlan.Exercises = newExercice;
        //         return existingWorkoutPlan;

        //     }
        //     catch (Exception e)
        //     {
        //         await transaction.RollbackAsync();
        //         throw new Exception(e.Message);
        //     }
        // }

        // public async Task<bool> DeleteWorkoutPlanByTitle(string title, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");

        //     var normalizedTitle = title.Trim().ToLower();
        //     var allPlan = await _workoutPlanRepository.GetAll();
        //     var workoutPlan = allPlan.FirstOrDefault(dp =>
        //         dp.CoachId == coachId &&
        //         dp.Title.Trim().ToLower() == normalizedTitle);
        //     if (workoutPlan == null)
        //         throw new Exception("Workout plan not found or unauthorized access");

        //     using var transaction = await _context.Database.BeginTransactionAsync();
        //     try
        //     {
        //         var workout = (await _workoutExerciseRepository.GetAll())
        //                     .Where(m => m.WorkoutPlanId == workoutPlan.Id)
        //                     .ToList();

        //         foreach (var x in workout)
        //             await _workoutExerciseRepository.Delete(x.Id);

        //         await _workoutPlanRepository.Delete(workoutPlan.Id);
        //         await transaction.CommitAsync();

        //         return true;

        //     }
        //     catch (System.Exception e)
        //     {
        //         await transaction.RollbackAsync();
        //         throw new Exception(e.Message);
        //     }
        // }

        // public async Task<List<WorkoutPlanResponseDTO>> GetAllWorkoutPlansDTO(ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID from token");

        //     var allPlans = await _workoutPlanRepository.GetAll();
        //     var coachPlans = allPlans.Where(p => p.CoachId == coachId).ToList();

        //     var allWorkouts = await _workoutExerciseRepository.GetAll();
        //     var exerciseGroups = allWorkouts
        //                      .Where(m => coachPlans.Select(p => p.Id).Contains(m.WorkoutPlanId))
        //                      .GroupBy(m => m.WorkoutPlanId)
        //                      .ToDictionary(g => g.Key, g => g.ToList());

        //     var result = coachPlans.Select(p => new WorkoutPlanResponseDTO
        //     {
        //         Id = p.Id,
        //         Title = p.Title,
        //         Description = p.Description,
        //         DurationInWeeks = p.DurationInWeeks,
        //         Exercises = exerciseGroups.ContainsKey(p.Id)
        //             ? exerciseGroups[p.Id].Select(m => new WorkoutExerciseResponseDTO
        //             {
        //                 Id = m.Id,
        //                 Name = m.Name,
        //                 Sets = m.Sets,
        //                 Reps = m.Reps,
        //                 RestSeconds = m.RestSeconds,
        //                 Notes = m.Notes
        //             }).ToList()
        //             : new List<WorkoutExerciseResponseDTO>()
        //     }).ToList();
        //     return result;
        // }


        // public async Task<WorkoutPlanResponseDTO?> GetWorkouttPlanByTitle(string title, ClaimsPrincipal user)
        // {
        //     var coachIdClaim = user.FindFirst("UserId")?.Value;
        //     if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
        //         throw new Exception("Invalid Coach ID");
        //     // Console.WriteLine("💕");
        //     var plans = await _workoutPlanRepository.GetAll();
        //     // Console.WriteLine($"{plans.FirstOrDefault(p=>p.CoachId==coachId)} ✅");
        //     var normalizedTitle = title.Trim();
        //     var plan = plans.FirstOrDefault(p =>
        //         p.CoachId == coachId &&
        //         p.Title == normalizedTitle);

        //     // Console.WriteLine($"\n\nExercise {normalizedTitle} {plan}✅");

        //     if (plan == null)
        //         return null;

        //     var exercise = (await _workoutExerciseRepository.GetAll())
        //                     .Where(m => m.WorkoutPlanId == plan.Id)
        //                     .ToList();


        //     return new WorkoutPlanResponseDTO
        //     {
        //         Id = plan.Id,
        //         Title = plan.Title,
        //         Description = plan.Description,
        //         DurationInWeeks = plan.DurationInWeeks,
        //         Exercises = exercise.Select(m => new WorkoutExerciseResponseDTO
        //         {
        //             Id = m.Id,
        //             Name = m.Name,
        //             Sets = m.Sets,
        //             Reps = m.Reps,
        //             RestSeconds = m.RestSeconds,
        //             Notes = m.Notes
        //         }).ToList()
        //     };
        // }



        public async Task<PlanAssignment> AssignPlanToClient(PlanAssignmentRequestDTO dto, ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");

            if (string.IsNullOrWhiteSpace(dto.ClientEmail))
                throw new Exception("Client email is required");

            if ((dto.WorkoutPlanID == null || dto.WorkoutPlanID == Guid.Empty) &&
                (dto.DietPlanID == null || dto.DietPlanID == Guid.Empty))
                throw new Exception("At least one plan (Workout or Diet) must be assigned.");

            // Validate Workout Plan if present
            if (dto.WorkoutPlanID.HasValue && dto.WorkoutPlanID.Value != Guid.Empty)
            {
                var workoutPlan = await _workoutPlanRepository.Get(dto.WorkoutPlanID.Value);
                if (workoutPlan == null || workoutPlan.CoachId != coachId)
                    throw new Exception("Invalid or unauthorized Workout Plan.");
            }

            // Validate Diet Plan if present
            if (dto.DietPlanID.HasValue && dto.DietPlanID.Value != Guid.Empty)
            {
                var dietPlan = await _dietPlanRepository.Get(dto.DietPlanID.Value);
                if (dietPlan == null || dietPlan.CoachId != coachId)
                    throw new Exception("Invalid or unauthorized Diet Plan.");
            }

            // Get client by email and coach match
            var client = (await _clientRepository.GetAll())
                            .FirstOrDefault(c =>
                                c.Email.Trim().ToLower() == dto.ClientEmail!.Trim().ToLower() &&
                                c.CoachId == coachId);

            if (client == null)
                throw new Exception("Client not found or not assigned to this coach.");
            dto.DueDate = DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc);

            // Create Plan Assignment
            var assignment = new PlanAssignment
            {
                Id = Guid.NewGuid(),
                ClientId = client.Id,
                WorkoutPlanId = dto.WorkoutPlanID,
                DietPlanId = dto.DietPlanID,
                AssignedByCoachId = coachId,
                AssignedOn = DateTime.UtcNow,
                DueDate = dto.DueDate,
                CompletionStatus = "Not Started"
            };

            // Notify client via SignalR
            await _hubContext.Clients
                .Group(client.Id.ToString())
                .SendAsync("ReceivePlanAssignmentNotification", new
                {
                    Message = "A new plan has been assigned to you.",
                    AssignedOn = assignment.AssignedOn,
                    DueDate = assignment.DueDate,
                    WorkoutPlanId = assignment.WorkoutPlanId,
                    DietPlanId = assignment.DietPlanId
                });

            try
            {

                await _planAssignmentRepository.Add(assignment);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine("💥 EF Error: " + ex.InnerException?.Message ?? ex.Message);
                throw;
            }
            return assignment;
        }

        public async Task<PagedResult<GetCoachDTO>> GetAllCoachesAsync(int pageNumber, int pageSize)
        {
            var allCoaches = await _coachRepository.GetAll();
            var pagedCoaches = allCoaches
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            var coachDtos = new List<GetCoachDTO>();

            foreach (var coach in pagedCoaches)
            {
                var user = await _userRepository.Get(coach.Email);
                coachDtos.Add(new GetCoachDTO
                {
                    Id = coach.Id,
                    Name = coach.Name,
                    YearsOfExperience = coach.YearsOfExperience,
                    Email = coach.Email,
                    IsActive = user?.IsActive ?? false
                });
            }


            return new PagedResult<GetCoachDTO>
            {
                Items = coachDtos,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalRecords = allCoaches.Count()
            };

        }

        public async Task<List<AssignedPlanNamesDTO>> GetAssignedPlans(string email, ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");
            // Find the client directly by email

            var client = (await _clientRepository.GetAll())
                            .FirstOrDefault(c => c.Email.Trim().ToLower() == email.Trim().ToLower() &&( c.CoachId == coachId||c.TemporaryCoachId==coachId));

            if (client == null)
                throw new Exception("Client not found");

            // Filter assignments for this client only
            var assignments = (await _planAssignmentRepository.GetAll())
                                .Where(a => a.ClientId == client.Id)
                                .OrderByDescending(a => a.Id)
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
                    AssignedOn = assignment.AssignedOn,
                    WorkoutPlanTitle = workoutPlan?.Title ?? "Not Assigned",
                    DietPlanTitle = dietPlan?.Title ?? "Not Assigned",
                    status = assignment.CompletionStatus,
                    progressPercentage = await CalculateWorkoutProgress(assignment.ClientId, assignment.Id)

                });
            }

            return result;
        }

        private async Task<double> CalculateWorkoutProgress(Guid clientId, Guid planAssignmentId)
        {


            // Total days between AssignedOn and DueDate (duration of plan)
            var assignment = (await _planAssignmentRepository.GetAll())
                                        .FirstOrDefault(p => p.Id == planAssignmentId);
            if (assignment == null) return -12;

            var totalDays = (assignment.DueDate ?? DateTime.UtcNow).Date
                          .Subtract(assignment.AssignedOn.Date).Days + 1;

            // Count number of workout logs submitted for this plan
            var completedDays = (await _workoutLogRepo.GetAll())
                .Where(w => w.ClientId == clientId && w.PlanAssignmentId == planAssignmentId)
                .Select(w => w.Date.Date)
                // .Distinct()
                .Count();
            Console.WriteLine("🎉🎉🎉🎉🎉" + completedDays);

            // Prevent division by zero
            if (totalDays <= 0) return 0;
            // totalDays = 1;
            double progress = (double)completedDays / totalDays * 100;
            return Math.Round(progress, 2); // Return as a percentage
        }
        public async Task<PagedResult<ClientWithoutPlansDTO>> GetClientsWithoutAssignedPlans(int pageNumber, int pageSize, string searchTerm, ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");
            var allClients = (await _clientRepository.GetAll())
                                .Where(c => c.CoachId == coachId||c.TemporaryCoachId==coachId)
                                .OrderByDescending(c => c.Id) 
                                .ToList();
            var allAssignments = await _planAssignmentRepository.GetAll();

            var assignedClientIds = allAssignments
                .OrderByDescending(pa => pa.AssignedOn)
                .Select(pa => pa.ClientId)
                .Distinct()
                .ToHashSet();

            // Map clients to DTOs and include their plan assignment status if available
            Func<IEnumerable<Client>, List<ClientWithoutPlansDTO>> mapToDto = clients =>
                clients.Select(c =>
                {
                    // Find the latest plan assignment for this client (if any)
                    var assignment = allAssignments
                        .Where(pa => pa.ClientId == c.Id)
                        .OrderByDescending(pa => pa.AssignedOn)
                        .FirstOrDefault();

                    return new ClientWithoutPlansDTO
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Email = c.Email,
                        status = assignment?.CompletionStatus ?? "Unassigned"
                    };
                }).ToList();

            List<ClientWithoutPlansDTO> filteredClients;

            if (string.Equals(searchTerm, "assigned", StringComparison.OrdinalIgnoreCase))
            {
                var assignedClients = allClients.Where(c => assignedClientIds.Contains(c.Id));
                filteredClients = mapToDto(assignedClients);
            }
            else if (string.Equals(searchTerm, "unassigned", StringComparison.OrdinalIgnoreCase))
            {
                var unassignedClients = allClients.Where(c => !assignedClientIds.Contains(c.Id));
                filteredClients = mapToDto(unassignedClients);
            }
            else if (string.Equals(searchTerm, "all", StringComparison.OrdinalIgnoreCase))
            {
                filteredClients = mapToDto(allClients);
            }
            else
            {
                // var unassignedClients = allClients.Where(c => !assignedClientIds.Contains(c.Id));
                // filteredClients = mapToDto(unassignedClients)
                //     .Where(c => c.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                //                 c.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                //     .ToList();
                var assignedClients = allClients.Where(c => assignedClientIds.Contains(c.Id));
                filteredClients = mapToDto(assignedClients);
            }

            var totalRecords = filteredClients.Count;

            var pagedClients = filteredClients
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedResult<ClientWithoutPlansDTO>
            {
                Items = pagedClients,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalRecords = totalRecords
            };
        }
        // public async Task<PagedResult<ClientWithoutPlansDTO>> GetClientsWithoutAssignedPlans(int pageNumber, int pageSize,string searchTerm)
        // {
        //     var allClients = await _clientRepository.GetAll();

        //     var allAssignments = await _planAssignmentRepository.GetAll();

        //     var assignedClientIds = allAssignments
        //                                 .Select(pa => pa.ClientId)
        //                                 .Distinct()
        //                                 .ToHashSet();

        //     var unassignedClients = allClients
        //                                 .Where(c => !assignedClientIds.Contains(c.Id))
        //                                 .Select(c => new ClientWithoutPlansDTO
        //                                 {
        //                                     Name = c.Name,
        //                                     Email = c.Email
        //                                 })
        //                                 .ToList();
        //     var x;
        //     if (searchTerm == "unassigned")
        //     {
        //         x = unassignedClients;

        //     }
        //     if (searchTerm == "assigned")
        //     {
        //         x = assignedClientIds;
        //     }
        //     if(searchTerm == "all")
        //     {
        //         x = allClients;
        //     }
        //     else
        //     {
        //         x = unassignedClients.Where(c => c.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
        //                                           c.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        //                              .ToList();
        //     }



        //     var totalRecords = x.Count;

        //     var pagedClients = x
        //         .Skip((pageNumber - 1) * pageSize)
        //         .Take(pageSize)
        //         .ToList();

        //     return new PagedResult<ClientWithoutPlansDTO>
        //     {
        //         Items = pagedClients,
        //         PageNumber = pageNumber,
        //         PageSize = pageSize,
        //         TotalRecords = totalRecords
        //     };
        // }

        public async Task<bool> MarkPlanAsCompletedAsync(Guid planAssignmentId, ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");
            var assignment = await _context.PlanAssignment.FindAsync(planAssignmentId);
            if (assignment == null)
                throw new Exception("Plan assignment not found.");

            if (assignment.AssignedByCoachId != coachId)
                throw new UnauthorizedAccessException("You are not authorized to update this plan.");

            assignment.CompletionStatus = "Completed";

            _context.PlanAssignment.Update(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ChartResponse> GetAssignedPlansChartAsync(ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");

            var allAssignments = await _planAssignmentRepository.GetAll();
            var workoutAssignments = allAssignments
                .Where(a => a.AssignedByCoachId == coachId && a.WorkoutPlanId != null)
                .Select(a => new { a.AssignedOn });

            var dietAssignments = allAssignments
                .Where(a => a.AssignedByCoachId == coachId && a.DietPlanId != null)
                .Select(a => new { a.AssignedOn });

            var calendar = CultureInfo.InvariantCulture.Calendar;

            var workoutByDay = workoutAssignments
                .GroupBy(w => w.AssignedOn.Date)
                .ToDictionary(g => g.Key, g => g.Count());

            var dietByDay = dietAssignments
                .GroupBy(d => d.AssignedOn.Date)
                .ToDictionary(g => g.Key, g => g.Count());

            var allDays = workoutByDay.Keys.Union(dietByDay.Keys).OrderBy(d => d).ToList();

            var labels = allDays.Select(day => day.ToString("yyyy-MM-dd")).ToList();
            var workoutData = allDays.Select(w => workoutByDay.ContainsKey(w) ? workoutByDay[w] : 0).ToList();
            var dietData = allDays.Select(w => dietByDay.ContainsKey(w) ? dietByDay[w] : 0).ToList();

            return new ChartResponse
            {
                Labels = labels,
                Datasets = new List<ChartDataset>
            {
                new ChartDataset
                {
                    Label = "Workout Plans Assigned",
                    Data = workoutData
                },
                new ChartDataset
                {
                    Label = "Diet Plans Assigned",
                    Data = dietData
                }
                }
            };
        }

        public async Task<bool> DeletePlanAsync(Guid PlanId)
        {
            var plan = (await _planAssignmentRepository.GetAll())
                .FirstOrDefault(p => p.Id == PlanId);
            if (plan == null)
            {
                throw new Exception("Plan not found");
            }
            try
            {
                await _planAssignmentRepository.Delete(plan.Id);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error ❌ {e.Message}");
                if (e.InnerException != null)
                    Console.WriteLine($"Inner Exception 💥 {e.InnerException.Message}");
                throw new Exception(e.Message);
            }
        }

        public async Task<List<bool>> AssignSubCoach( ClaimsPrincipal user, AssignSubCoachDTO dto)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");

            var client = await _clientRepository.Get(dto.ClientId);
            if (client == null || client.CoachId != coachId)
                throw new Exception("Client not found or unauthorized access");

            var subCoach = await _coachRepository.Get(dto.SubCoachId);
            if (subCoach == null || subCoach.Id == coachId)
                throw new Exception("Sub-coach not found or cannot assign to self");

            client.TemporaryCoachId = dto.SubCoachId;
            client.TemporaryCoachStartDate = DateTime.UtcNow;
            client.TemporaryCoachEndDate = dto.EndDate ;

            try
            {
                await _clientRepository.Update( dto.ClientId,client);
                return new List<bool> { true };
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error ❌ {e.Message}");
                if (e.InnerException != null)
                    Console.WriteLine($"Inner Exception 💥 {e.InnerException.Message}");
                return new List<bool> { false };
            }
        }
    }
}
