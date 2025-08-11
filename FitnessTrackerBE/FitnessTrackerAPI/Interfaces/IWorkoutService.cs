using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IWorkoutService
    {
        Task<WorkoutResponseDTO> AddWorkout(WorkoutCreateDTO dto, ClaimsPrincipal user);
        Task<WorkoutResponseDTO?> GetWorkoutById(Guid workoutId, ClaimsPrincipal user);
        Task<IEnumerable<WorkoutResponseDTO>> GetWorkoutsForCurrentClient(ClaimsPrincipal user);
        Task<IEnumerable<WorkoutResponseDTO>> GetWorkoutsByClientId(Guid clientId);
    }
}