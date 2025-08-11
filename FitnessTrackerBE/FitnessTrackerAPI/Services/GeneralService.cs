using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Services
{
    public class GeneralService : IGeneralService
    {
        private readonly IRepository<Guid, DietPlan> _dietPlanRepo;
        private readonly IRepository<Guid, DietMeal> _dietMealRepo;
        private readonly IRepository<Guid, WorkoutPlan> _workoutPlanRepo;
        private readonly IRepository<Guid, WorkoutExercise> _exerciseRepo;

        public GeneralService(
            IRepository<Guid, DietPlan> dietPlanRepo,
            IRepository<Guid, DietMeal> dietMealRepo,
            IRepository<Guid, WorkoutPlan> workoutPlanRepo,
            IRepository<Guid, WorkoutExercise> exerciseRepo)
        {
            _dietPlanRepo = dietPlanRepo;
            _dietMealRepo = dietMealRepo;
            _workoutPlanRepo = workoutPlanRepo;
            _exerciseRepo = exerciseRepo;
        }

        public async Task<DietPlanResponseDTO?> GetDietPlanByTitle(string title)
        {
            var plans = await _dietPlanRepo.GetAll();
            var plan = plans.FirstOrDefault(p => p.Title.Equals(title, StringComparison.OrdinalIgnoreCase));

            if (plan == null)
                return null;
            var coachId = plan.CoachId;
            var meals = await _dietMealRepo.GetAll();
            var relatedMeals = meals
                .Where(m => m.DietPlanId == plan.Id)
                .Select(m => new DietMealDTO
                {
                    MealType = m.MealType,
                    MealName = m.MealName,
                    Calories = m.Calories,
                    ProteinGrams = m.ProteinGrams,
                    CarbsGrams = m.CarbsGrams,
                    FatGrams = m.FatGrams
                })
                .ToList();

            return new DietPlanResponseDTO
            {
                CoachId = coachId,
                Title = plan.Title,
                MealTypes = relatedMeals
            };
        }

        public async Task<WorkoutPlanResponseDTO?> GetWorkouttPlanByTitle(string title)
        {
            var plans = await _workoutPlanRepo.GetAll();
            var plan = plans.FirstOrDefault(p => p.Title.Equals(title, StringComparison.OrdinalIgnoreCase));

            if (plan == null)
                return null;

            var exercise = (await _exerciseRepo.GetAll())
                            .Where(m => m.WorkoutPlanId == plan.Id)
                            .ToList();

            var coachId = plan.CoachId;
            return new WorkoutPlanResponseDTO
            {
                CoachId = coachId,
                Id = plan.Id,
                Title = plan.Title,
                Description = plan.Description,
                DurationInWeeks = plan.DurationInWeeks,
                Exercises = exercise.Select(m => new WorkoutExerciseResponseDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Sets = m.Sets,
                    Reps = m.Reps,
                    RestSeconds = m.RestSeconds,
                    Notes = m.Notes
                }).ToList()
            };
        }
    }
}
