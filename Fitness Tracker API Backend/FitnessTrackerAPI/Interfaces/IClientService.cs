using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FirstAPI.Models.DTOs;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTO;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IClientService
    {
        public Task<SignUpResponseDTO> AddCoach(ClientAddRequestDTO client);
        public Task<List<AssignedPlanNamesDTO>> GetAssignedPlansForClient(ClaimsPrincipal user);
        public Task<string> UpdateClientDetails(ClaimsPrincipal user, ClientUpdateRequestDTO clientUpdate);
        Task<IEnumerable<Client>> GetClientById(Guid clientId);

        public Task<Client> GetMyDetails(ClaimsPrincipal user);
        public Task<bool> UpdatePlanStatus(Guid planAssignmentId, ClaimsPrincipal user, string status);
        public Task<PagedResult<GetClientDTO>> GetAllClientsAsync(int pageNumber, int pageSize);
        

    }
}