using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IProgressService
    {
        Task<ProgressResponseDTO> AddProgressAsync(ProgressCreateDTO dto, ClaimsPrincipal user);
        Task<IEnumerable<ProgressResponseDTO>> GetProgressByClientIdAsync(Guid clientId, ClaimsPrincipal user);
        Task<IEnumerable<ProgressResponseDTO>> GetMyProgressAsync(ClaimsPrincipal user);
        Task<ProgressGraphDTO> GetProgressGraphByClientId(Guid clientId);
    }

}