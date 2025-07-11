using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IWorkoutPlan
    {
        public Task<WorkoutPlan> AddWorkoutPlan(WorkoutPlanCreateRequestDTO workout, ClaimsPrincipal user);
        public Task<WorkoutPlan> UpdateWorkoutPlanByTitle(Guid id, WorkoutPlanCreateRequestDTO dto, ClaimsPrincipal user);
        public Task<bool> DeleteWorkoutPlanByTitle(Guid id, ClaimsPrincipal user);
        public Task<PagedResult<WorkoutPlanResponseDTO>> GetAllWorkoutPlansDTO(ClaimsPrincipal user, int pageNumber, int pageSize);
        public Task<WorkoutPlanResponseDTO?> GetWorkouttPlanByTitle(Guid Id, ClaimsPrincipal user);
    }
}