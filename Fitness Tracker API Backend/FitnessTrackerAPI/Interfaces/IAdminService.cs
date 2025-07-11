using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IAdminService
    {
        Task<SignUpResponseDTO> AddAdminAsync(UserDTO userDto);
        Task<bool> DeleteUserAsync(Guid userId);
        public Task<bool> DeleteClientUserAsync(Guid userId);
        // Task<bool> UpdateUserAsync(UserDTO userDto);
        // Task<bool> DeleteUserAsync(int userId);
        // Task<UserDTO> GetUserByIdAsync(int userId);
        // Task<IEnumerable<UserDTO>> GetAllUsersAsync();
        // Task<bool> AssignRoleToUserAsync(int userId, string roleName);
        // Task<IEnumerable<string>> GetAllRolesAsync();
    }
}