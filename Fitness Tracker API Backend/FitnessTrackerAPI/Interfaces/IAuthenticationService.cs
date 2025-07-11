using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;

namespace FitnessTrackerAPI.Interfaces
{
    public interface IAuthenticationService
    {
        public Task<UserLoginResponse> Login(UserLoginRequest user);

        public Task<UserLoginResponse> RefreshToken(TokenRefreshRequest request);
        
        

    }
}