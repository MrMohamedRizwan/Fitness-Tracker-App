using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using AutoMapper;
using FirstAPI.Models.DTOs;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Repository;
using FitnessTrackerAPI.Services.Hubs;
using FitnessTrackerAPI.Models.DTO;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System.Globalization;

namespace FitnessTrackerAPI.Services
{
    public class AdminService : IAdminService
    {
        private readonly FitnessDBContext _context;
        private readonly IMapper _mapper;
        private readonly IRepository<string, User> _userRepository;
        private readonly IEncryptionService _encryptionService;
        private readonly IRepository<Guid, Admin> _adminRepository;
        private readonly IRepository<Guid, Coach> _coachRepository;
        private readonly IRepository<Guid, Client> _clientRepository;


        private readonly ITokenService _tokenService;
        public AdminService(IMapper mapper, FitnessDBContext context
                            , IEncryptionService encryptionService,
                            IRepository<string, User> userRepository,
                            IRepository<Guid, Admin> adminRepository,
                            IRepository<Guid, Coach> coachRepository,
                            ITokenService tokenService,
                            IRepository<Guid, Client> clientRepository
                            )
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _context = context;
            _adminRepository = adminRepository;
            _encryptionService = encryptionService;
            _coachRepository = coachRepository;
            _tokenService = tokenService;
            _clientRepository = clientRepository;
        }

        public async Task<SignUpResponseDTO> AddAdminAsync(UserDTO admin)
        {
            try
            {
                // System.Console.WriteLine("Before DB 😒");

                var user = _mapper.Map<UserDTO, User>(admin);
                var existingUser = await _userRepository.Get(admin.Email);
                if (existingUser != null)
                    throw new Exception("User Already Exist");

                var encryptedData = await _encryptionService.EncryptData(new EncryptModel
                {
                    Data = admin.Password
                });

                user.Password = encryptedData.EncryptedData;
                user.Role = "Admin";
                user.RefreshToken = "null";
                user = await _userRepository.Add(user);

                var newAdmin = _mapper.Map<UserDTO, Admin>(admin);
                newAdmin.Email = user.Email;


                newAdmin = await _adminRepository.Add(newAdmin);
                if (newAdmin == null)
                    throw new Exception("Could not add Coach");
                var accessToken = await _tokenService.GenerateToken(user);
                var refreshToken = _tokenService.GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userRepository.Update(user.Email, user); // persist token changes
                // await transaction.CommitAsync();
                return new SignUpResponseDTO
                {
                    Id = newAdmin.Id,
                    Email = newAdmin.Email,
                    Token = accessToken,
                    RefreshToken = refreshToken

                };
            }
            catch (Exception e)
            {
                // await transaction.RollbackAsync();
                Console.WriteLine($"Error ❌ {e.Message}");
                if (e.InnerException != null)
                    Console.WriteLine($"Inner Exception 💥 {e.InnerException.Message}");
                throw new Exception(e.Message);
            }
        }


        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var coach = (await _coachRepository.GetAll())
                .FirstOrDefault(c => c.Id == userId);
            var user = (await _userRepository.GetAll())
                .FirstOrDefault(u => u.Email == coach.Email);
            if (coach == null || user == null)
            {
                throw new Exception("User not found");
            }
            await _coachRepository.Delete(coach.Id);
            await _userRepository.Delete(user.Email);
            return true;
        }
        public async Task<bool> DeleteClientUserAsync(Guid userId)
        {
            var client=(await _clientRepository.GetAll())
                .FirstOrDefault(c => c.Id == userId);
            var user= (await _userRepository.GetAll())
                .FirstOrDefault(u => u.Email == client.Email);
            if (client == null || user == null)
            {
                throw new Exception("User not found");
            }
            await _clientRepository.Delete(client.Id);
            await _userRepository.Delete(user.Email);
            return true;
        }
    }
}