using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IGeneralService
    {
        public Task<DietPlanResponseDTO?> GetDietPlanByTitle(string title);
        public Task<WorkoutPlanResponseDTO?> GetWorkouttPlanByTitle(string title);
    }
}