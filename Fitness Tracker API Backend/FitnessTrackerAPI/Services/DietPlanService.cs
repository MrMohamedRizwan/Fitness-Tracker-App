using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;


namespace FitnessTrackerAPI.Services
{
    public class DietPlanService : IDietServices
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




        public DietPlanService(IMapper mapper,
                            IEncryptionService encryptionService,
                            IRepository<string, User> userRepository,
                            IRepository<Guid, Coach> coachRepository,
                            IRepository<Guid, DietMeal> dietMealRepository,
                            IRepository<Guid, DietPlan> dietPlanRepository,
                            IRepository<Guid, WorkoutPlan> workoutPlanRepository,
                            IRepository<Guid, WorkoutExercise> workoutExerciseRepository,
                            FitnessDBContext context,
                             IRepository<Guid, PlanAssignment> planAssignmentRepository,
                              IRepository<Guid, Client> clientRepository
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

            _context = context;
        }
        public async Task<DietPlan> AddMeal(DietPlanCreateRequestDTO diet, ClaimsPrincipal user)
        {

            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");
            var existingPlans = await _dietPlanRepository.GetAll();
            if (existingPlans.Any(p => p.CoachId == coachId && p.Title.ToLower() == diet.Title.ToLower()))
            {
                throw new Exception("A diet plan with this title already exists. Choose a new title or edit the previous diet plan");
            }
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var dietPlan = _mapper.Map<DietPlan>(diet);
                dietPlan.Id = Guid.NewGuid();
                dietPlan.CoachId = coachId;

                dietPlan = await _dietPlanRepository.Add(dietPlan);

                var meals = diet.Meals.Select(mealDto =>
                {
                    var meal = _mapper.Map<DietMeal>(mealDto);
                    meal.Id = Guid.NewGuid();
                    meal.DietPlanId = dietPlan.Id;
                    return meal;
                }).ToList();

                foreach (var meal in meals)
                {
                    await _dietMealRepository.Add(meal);
                }

                await transaction.CommitAsync();
                dietPlan.Meals = meals;
                return dietPlan;
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                throw new Exception(e.Message);
            }
        }
        public async Task<DietPlan> UpdateDietPlanByTitle(Guid id, DietPlanCreateRequestDTO dto, ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");

            // var normalizedTitle = title.Trim().ToLower();

            var dietPlans = await _dietPlanRepository.GetAll();
            var existingDietPlan = dietPlans.FirstOrDefault(dp =>
                dp.CoachId == coachId &&
                dp.Id==id
            );

            if (existingDietPlan == null)
                throw new Exception("Diet plan not found or unauthorized access");

            // // Check for duplicate title (excluding the current one)
            // var duplicateTitle = dietPlans.Any(dp =>
            //     dp.CoachId == coachId &&
            //     dp.Id != existingDietPlan.Id &&
            //     dp.DietTitle.Trim().ToLower() == dto.DietTitle.Trim().ToLower());

            // if (duplicateTitle)
            //     throw new Exception("A diet plan with this title already exists");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Update diet title
                existingDietPlan.Title = dto.Title.Trim();

                // Delete existing meals
                var existingMeals = (await _dietMealRepository.GetAll())
                    .Where(m => m.DietPlanId == existingDietPlan.Id)
                    .ToList();

                foreach (var meal in existingMeals)
                    await _dietMealRepository.Delete(meal.Id);

                // Add new meals
                var newMeals = dto.Meals.Select(mealDto =>
                {
                    var meal = _mapper.Map<DietMeal>(mealDto);
                    meal.Id = Guid.NewGuid();
                    meal.DietPlanId = existingDietPlan.Id;
                    return meal;
                }).ToList();

                foreach (var meal in newMeals)
                    await _dietMealRepository.Add(meal);

                await transaction.CommitAsync();

                existingDietPlan.Meals = newMeals;
                return existingDietPlan;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

        }

        public async Task<bool> DeleteDietPlanByTitle(Guid id, ClaimsPrincipal user)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");

            // var normalizedTitle = title.Trim().ToLower();

            var allPlans = await _dietPlanRepository.GetAll();
            var dietPlan = allPlans.FirstOrDefault(dp =>
                dp.CoachId == coachId &&
                dp.Id==id);

            if (dietPlan == null)
                throw new Exception("Diet plan not found or unauthorized access");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Delete all associated meals
                var meals = (await _dietMealRepository.GetAll())
                    .Where(m => m.DietPlanId == dietPlan.Id)
                    .ToList();

                foreach (var meal in meals)
                    await _dietMealRepository.Delete(meal.Id);

                // Delete the diet plan
                await _dietPlanRepository.Delete(dietPlan.Id);

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PagedResult<DietPlanResponseDTO>> GetAllDietPlansDTO(ClaimsPrincipal user, int pageNumber, int pageSize)
        {
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID from token");

            var allPlans = await _dietPlanRepository.GetAll();
            var coachPlans = allPlans.Where(p => p.CoachId == coachId).ToList();

            var allMeals = await _dietMealRepository.GetAll();
            var mealGroups = allMeals
                             .Where(m => coachPlans.Select(p => p.Id).Contains(m.DietPlanId))
                             .GroupBy(m => m.DietPlanId)
                             .ToDictionary(g => g.Key, g => g.ToList());

            var result = coachPlans.Select(p => new DietPlanResponseDTO
            {
                Id=p.Id,
                CoachId =p.CoachId,
                Title = p.Title,
                Description=p.Description,
                DurationInWeeks=p.DurationInWeeks,
                MealTypes = mealGroups.ContainsKey(p.Id)
                    ? mealGroups[p.Id].Select(m => new DietMealDTO
                    {
                        MealType = m.MealType,
                        MealName = m.MealName,
                        Calories = m.Calories,
                        ProteinGrams = m.ProteinGrams,
                        CarbsGrams = m.CarbsGrams,
                        FatGrams = m.FatGrams
                    }).ToList()
                    : new List<DietMealDTO>()
            }).ToList();

            var pagedItems = result
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

            return new PagedResult<DietPlanResponseDTO>
            {
                Items = pagedItems,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalRecords = result.Count
            };
        }
        public async Task<DietPlanResponseDTO?> GetDietPlanByTitle(Guid Id, ClaimsPrincipal user)
        {
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;
            var coachIdClaim = user.FindFirst("UserId")?.Value;
            if (coachIdClaim == null || !Guid.TryParse(coachIdClaim, out Guid coachId))
                throw new Exception("Invalid Coach ID");
            if (roleClaim == "Coach")
            {


                var plans = await _dietPlanRepository.GetAll();
                var plan = plans
                            .Where(p => p.CoachId == coachId)
                            .FirstOrDefault(p => p.Id.Equals(Id));
                            

                if (plan == null)
                    return null;

                var meals = (await _dietMealRepository.GetAll())
                                .Where(m => m.DietPlanId == plan.Id)
                                .ToList();
                var allClients = (await _clientRepository.GetAll())
                                    .ToList();
                var assignments = (await _planAssignmentRepository.GetAll())
                    .Where(a => a.DietPlanId == plan.Id)
                    .OrderByDescending(a=>a.AssignedOn)
                    .GroupBy(a => a.ClientId)
                    .Select(g =>
                    {
                        var a = g.First();
                        return new
                        {
                            a.Id,
                            a.ClientId,
                            a.AssignedOn,
                            a.CompletionStatus,
                            ClientName = allClients.FirstOrDefault(c => c.Id == a.ClientId)?.Name,
                            ClientEmail = allClients.FirstOrDefault(c => c.Id == a.ClientId)?.Email
                        };
                    })
                    .ToList();

                return new DietPlanResponseDTO
                {
                    Id = plan.Id,
                    CoachId = plan.CoachId,
                    Title = plan.Title,
                    Description = plan.Description,
                    DurationInWeeks = plan.DurationInWeeks,
                    Clients = assignments.Select(c =>
                    {
                        var assignment = assignments.FirstOrDefault(a => a.ClientId == c.Id);
                        return new AssignedClientResponseDTO
                        {
                            Name = c.ClientName,
                            Email = c.ClientEmail,
                            AssignedOn = c.AssignedOn,
                            Status = c.CompletionStatus,
                        };
                    }).ToList(),
                    MealTypes = meals.Select(m => new DietMealDTO
                    {
                        Id = m.Id,
                        MealType = m.MealType,
                        MealName = m.MealName,
                        Calories = m.Calories,
                        ProteinGrams = m.ProteinGrams,
                        CarbsGrams = m.CarbsGrams,
                        FatGrams = m.FatGrams
                    }).ToList()
                };
            }
            else if (roleClaim == "Client")
            {
                var plans = await _dietPlanRepository.GetAll();
                var plan = plans
                            .FirstOrDefault(p => p.Id.Equals(Id));

                if (plan == null)
                    return null;

                var meals = (await _dietMealRepository.GetAll())
                                .Where(m => m.DietPlanId == plan.Id)
                                .ToList();

                return new DietPlanResponseDTO
                {
                    Id = plan.Id,
                    CoachId = plan.CoachId,
                    Title = plan.Title,
                    Description = plan.Description,
                    DurationInWeeks = plan.DurationInWeeks,
                    MealTypes = meals.Select(m => new DietMealDTO
                    {
                        Id = m.Id,
                        MealType = m.MealType,
                        MealName = m.MealName,
                        Calories = m.Calories,
                        ProteinGrams = m.ProteinGrams,
                        CarbsGrams = m.CarbsGrams,
                        FatGrams = m.FatGrams
                    }).ToList()
                };

            }
            else
            {
                throw new Exception("Unauthorized access");
            }
        }


        
    }
}