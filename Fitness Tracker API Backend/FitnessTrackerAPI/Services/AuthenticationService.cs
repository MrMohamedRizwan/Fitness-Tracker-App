using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTOs;
using Microsoft.IdentityModel.Tokens;

namespace FitnessTrackerAPI.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly ITokenService _tokenService;
        private readonly IEncryptionService _encryptionService;
        private readonly IRepository<string, User> _userRepository;
        public AuthenticationService(ITokenService tokenService,
                                    IEncryptionService encryptionService,
                                    IRepository<string, User> userRepository,
                                    ILogger<AuthenticationService> logger)
        {
            _tokenService = tokenService;
            _encryptionService = encryptionService;
            _userRepository = userRepository;
        }
        public async Task<UserLoginResponse> Login(UserLoginRequest user)
        {
            var dbUser = await _userRepository.Get(user.Username);
            if (dbUser == null)
                throw new Exception("No such user");

            if (!_encryptionService.Verify(user.Password, dbUser.Password))
                throw new Exception("Invalid password");

            var accessToken = await _tokenService.GenerateToken(dbUser);
            var refreshToken = _tokenService.GenerateRefreshToken();

            dbUser.RefreshToken = refreshToken;
            dbUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            dbUser.LastLoginAt = DateTime.UtcNow;
            dbUser.IsActive = true;

            await _userRepository.Update(dbUser.Email, dbUser);

            return new UserLoginResponse
            {
                Username = dbUser.Email,
                Token = accessToken,
                RefreshToken = refreshToken
            };
        }
        public async Task<UserLoginResponse> RefreshToken(TokenRefreshRequest request)
        {
            var accessToken = request.AccessToken;
            var refreshToken = request.RefreshToken;

            if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
            {
                throw new SecurityTokenException("Invalid token");
            }
            
                // var coachIdClaim = user.FindFirst("UserId")?.Value;
                var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
            
                var email = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;


                var dbUser = await _userRepository.Get(email);
                // System.Console.WriteLine($"DB User: {email}, Refresh Token: {dbUser?.RefreshToken}, Expiry: {dbUser?.RefreshTokenExpiryTime},{refreshToken}  ✅✅✅");
                if (dbUser == null ||
                    dbUser.RefreshToken != refreshToken ||
                    dbUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
                {
                    throw new SecurityTokenException("Invalid refresh token");
                }

                var newAccessToken = await _tokenService.GenerateToken(dbUser);
                var newRefreshToken = _tokenService.GenerateRefreshToken();

                dbUser.RefreshToken = newRefreshToken;
                dbUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await _userRepository.Update(dbUser.Email, dbUser);

                return new UserLoginResponse
                {
                    Username = dbUser.Email,
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken
                };
            

        }
    }
}