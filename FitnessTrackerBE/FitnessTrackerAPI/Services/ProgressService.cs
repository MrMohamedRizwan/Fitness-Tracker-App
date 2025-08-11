using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Migrations;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Repository;
using FitnessTrackerAPI.Services.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;

namespace FitnessTrackerAPI.Services
{
    public class ProgressService : IProgressService
    {
        private readonly IRepository<Guid, Progress> _progressRepo;
        private readonly IRepository<Guid, Client> _clientRepo;
        private readonly IRepository<Guid, PlanAssignment> _planAssignmentRepo;
        private readonly IRepository<Guid, Workout> _workoutRepo;
        private readonly IAWSService _awsS3Service;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ProgressService(IRepository<Guid, Progress> progressRepo,
                               IRepository<Guid, Client> clientRepo,
                               IRepository<Guid, PlanAssignment> planAssignmentRepo,
                               IRepository<Guid, Workout> WorkoutRepo,
                               IHubContext<NotificationHub> hubContext,
                               IAWSService awsS3Service
                               )
        {
            _workoutRepo = WorkoutRepo;
            _progressRepo = progressRepo;
            _clientRepo = clientRepo;
            _hubContext = hubContext;
            _planAssignmentRepo = planAssignmentRepo;
            _awsS3Service = awsS3Service;
        }
        public async Task<ProgressResponseDTO> AddProgressAsync(ProgressCreateDTO dto, ClaimsPrincipal user)
        {
            var clientIdClaim = user.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(clientIdClaim) || !Guid.TryParse(clientIdClaim, out var clientId))
                throw new UnauthorizedAccessException("Invalid or missing Client ID.");

            var client = await _clientRepo.Get(clientId);
            if (client == null)
                throw new InvalidOperationException("Client not found.");

            var allowedImageTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (dto.ImageFile == null || !allowedImageTypes.Contains(dto.ImageFile.ContentType.ToLower()))
                throw new InvalidOperationException("Invalid file type. Only image files (JPEG, PNG, GIF, WEBP) are allowed.");
            // Upload file and get the S3 key
            string objectKey = await _awsS3Service.UploadFileAsync(dto.ImageFile, "progress-images");

            var progress = new Progress
            {
                Id = Guid.NewGuid(),
                ClientId = clientId,
                ImagePath = objectKey,
                Height = dto.Height,
                Weight = dto.Weight,
                UploadedAt = DateTime.UtcNow
            };

            await _progressRepo.Add(progress);

            // Find assigned coach for signalR notification
            var assignment = (await _planAssignmentRepo.GetAll())
                .FirstOrDefault(a => a.ClientId == clientId &&
                                     a.AssignedByCoachId != null &&
                                     (a.DueDate == null || a.DueDate >= DateTime.UtcNow));

            if (assignment != null)
            {
                var coachId = assignment.AssignedByCoachId.ToString();
                Console.WriteLine("\n\n\n\nCoach ID: \n\n\n\n" + coachId);

                await _hubContext.Clients.Group(coachId).SendAsync("ProgressUploaded", new
                {
                    ClientId = clientId,
                    ClientName = client?.Name,
                    Height = progress.Height,
                    Weight = progress.Weight,
                    UploadedAt = progress.UploadedAt
                });
            }


            // Generate pre-signed URL with expiration for the client to view/download the image
            string preSignedUrl = _awsS3Service.GeneratePreSignedURL(objectKey, expiryMinutes: 60);

            return new ProgressResponseDTO
            {
                Id = progress.Id,
                ClientId = progress.ClientId,
                ImagePath = preSignedUrl,  // Return the temporary access URL
                Height = progress.Height,
                Weight = progress.Weight,
                UploadedAt = progress.UploadedAt
            };
        }


        public async Task<IEnumerable<ProgressResponseDTO>> GetProgressByClientIdAsync(Guid clientId, ClaimsPrincipal user)
        {
            
            var role = user.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = user.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Invalid User ID");
            var assignmentIds = new List<Guid>();
            if (role == "Coach")
            {
                // Verify coach is assigned to this client
                var assignments = await _planAssignmentRepo.GetAll();
                var assignedToCoach = assignments.Any(a => a.ClientId == clientId && a.AssignedByCoachId == userId);
                assignmentIds = assignments.Select(p => p.Id).ToList();

                var TempCoach = (await _clientRepo.Get(clientId))?.TemporaryCoachId;

                if (!assignedToCoach && TempCoach != userId)
                    throw new UnauthorizedAccessException("Coach not assigned to this client.");
                    
                
            }
            else if (role == "Client")
            {
                // Clients can only view their own progress
                if (clientId != userId)
                    throw new UnauthorizedAccessException("Clients can only access their own progress.");
            }
            else
            {
                throw new UnauthorizedAccessException("Invalid role.");
            }

            var allProgress = await _progressRepo.GetAll();
            var progressList = allProgress
                .Where(p => p.ClientId == clientId)
                .OrderByDescending(p=> p.UploadedAt)
                .ToList();

            var responseList = new List<ProgressResponseDTO>();
            

            //     var totalCaloriesBurnt = await GetCaloriesBurnt(clientId, assignmentIds[1]);
            // var workoutCompletionPercent = await CalculateWorkoutProgress(clientId, assignmentIds[1]);
            foreach (var p in progressList)
            {
                var weightChangeSummary = await GetWeightChange(clientId);
                Console.WriteLine("😂😂😂😂😂😂");

                responseList.Add(new ProgressResponseDTO
                {
                    Id = p.Id,
                    ClientId = p.ClientId,
                    ImagePath = p.ImagePath,
                    Height = p.Height,
                    Weight = p.Weight,
                    UploadedAt = p.UploadedAt,
                    WeightChangeSummary = weightChangeSummary
                    
                });
            }

            return responseList;

        }

        public async Task<IEnumerable<ProgressResponseDTO>> GetMyProgressAsync(ClaimsPrincipal user)
        {
            var clientIdClaim = user.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(clientIdClaim) || !Guid.TryParse(clientIdClaim, out var clientId))
                throw new UnauthorizedAccessException("Invalid or missing Client ID.");

            var allProgress = await _progressRepo.GetAll();
            var progressList = allProgress
                .Where(p => p.ClientId == clientId)
                .OrderByDescending(p => p.UploadedAt)
                .ToList();

            var responseList = new List<ProgressResponseDTO>();

            foreach (var p in progressList)
            {
                // var workoutCompletionPercent = await CalculateWorkoutProgress(clientId, p.Id);
                var weightChangeSummary = await GetWeightChange(clientId);
                // var totalCaloriesBurnt = await GetCaloriesBurnt(clientId, p.Id);

                responseList.Add(new ProgressResponseDTO
                {
                    Id = p.Id,
                    ClientId = p.ClientId,
                    ImagePath = p.ImagePath,
                    Height = p.Height,
                    Weight = p.Weight,
                    UploadedAt = p.UploadedAt,
                    WeightChangeSummary= weightChangeSummary
                
                });
            }

            return responseList;
        }

        public async Task<ProgressGraphDTO> GetProgressGraphByClientId(Guid clientId)
        {
            var workouts = (await _workoutRepo.GetAll())
                .Where(w => w.ClientId == clientId && w.PlanAssignmentId.HasValue)
                .ToList();

            if (!workouts.Any())
            {
                return new ProgressGraphDTO
                {
                    Assignments = new List<PlanProgressDTO>()
                };
            }

            var assignmentIds = workouts
                .Select(w => w.PlanAssignmentId!.Value)
                .Distinct()
                .ToList();

            var result = new List<PlanProgressDTO>();

            foreach (var assignmentId in assignmentIds)
            {
                var assignment = (await _planAssignmentRepo.GetAll()).FirstOrDefault(p => p.Id == assignmentId);
                if (assignment == null) continue;

                var progress = await CalculateWorkoutProgress(clientId, assignmentId);
                var totalBurnt = await GetCaloriesBurnt(clientId, assignmentId);
                var totalIntake = await GetCaloriesIntake(clientId, assignmentId);

                // Group workouts by date to get calories per date
                var submittedOn = workouts
                    .Where(w => w.PlanAssignmentId == assignmentId)
                    .GroupBy(w => w.Date.Date)
                    .Select(g => new DateCaloriesDTO
                    {
                        Date = g.Key,
                        CaloriesBurnt = g.Sum(w => w.caloriesBurnt),
                        CaloriesIntake = g.Sum(w => w.caloriesTaken)
                    })
                    .OrderBy(d => d.Date)
                    .ToList();

                result.Add(new PlanProgressDTO
                {
                    PlanAssignmentId = assignment.Id,
                    // PlanName = assignment.PlanName,
                    ProgressPercentage = progress,
                    CaloriesBurnt = totalBurnt,
                    caloriesIntake = totalIntake,
                    AssignedOn = assignment.AssignedOn,
                    DueDate = assignment.DueDate,
                    SubmittedOn = submittedOn
                });
            }

            return new ProgressGraphDTO
            {
                Assignments = result
            };
        }

        public async Task<double> CalculateWorkoutProgress(Guid clientId, Guid planAssignmentId)
        {


            // Total days between AssignedOn and DueDate (duration of plan)
            var assignment = (await _planAssignmentRepo.GetAll())
                                        .FirstOrDefault(p => p.Id == planAssignmentId);
            if (assignment == null) return -12;

            var totalDays = (assignment.DueDate ?? DateTime.UtcNow).Date
                          .Subtract(assignment.AssignedOn.Date).Days + 1;

            // Count number of workout logs submitted for this plan
            var completedDays = (await _workoutRepo.GetAll())
                .Where(w => w.ClientId == clientId && w.PlanAssignmentId == planAssignmentId)
                .Select(w => w.Date.Date)
                // .Distinct()
                .Count();
            Console.WriteLine("🎉🎉🎉🎉🎉" + completedDays);

            // Prevent division by zero
            if (totalDays <= 0) return 0;
            // totalDays = 1;
            double progress = (double)completedDays / totalDays * 100;
            return Math.Round(progress, 2); // Return as a percentage
        }
        public async Task<int> GetCaloriesIntake(Guid clientId, Guid planAssignmentId)
        {
            var workouts = (await _workoutRepo.GetAll())
                ?.Where(w => w != null && w.PlanAssignmentId == planAssignmentId)
                .ToList();

            if (workouts == null || workouts.Count == 0)
                return 0;

            // Safely sum CaloriesBurnt if the property exists and is not null
            int totalCalories = workouts
                .Where(w => w != null)
                .Sum(w => (w?.caloriesTaken) ?? 0);
            
            return totalCalories;

        }
        public async Task<string> GetWeightChange(Guid clientId)
        {
            var weightLogs = (await _progressRepo.GetAll())
                .Where(p => p.ClientId == clientId)
                .OrderBy(p => p.UploadedAt)
                .ToList();

            if (weightLogs.Count < 2) return "Insufficient data";

            var startWeight = weightLogs.First().Weight;
            var endWeight = weightLogs.Last().Weight;

            var change = endWeight - startWeight;
            return change >= 0
                ? $"Gained {change} kg"
                : $"Lost {Math.Abs(change)} kg";
        }
        public async Task<int> GetCaloriesBurnt(Guid clientId, Guid planAssignmentId)
        {
            // return -1;
            // Console.WriteLine($"😉❌{clientId}. plan &{planAssignmentId}");
            var workouts = (await _workoutRepo.GetAll())
                ?.Where(w => w != null && w.PlanAssignmentId == planAssignmentId )
                .ToList();

            if (workouts == null || workouts.Count == 0)
                return 0;

            // Safely sum CaloriesBurnt if the property exists and is not null
            var allDate= (await _workoutRepo.GetAll())
                .Where(w => w.ClientId == clientId && w.PlanAssignmentId == planAssignmentId)
                .Select(w => w.Date.Date)
                .Distinct()
                .ToList();
            // for (int i = 0; i < allDate.Count; i++)
            // {
            //     Console.WriteLine("🎉🎉🎉🎉🎉" + allDate[i]);
            // }
            // Console.WriteLine("\n\n\n\n\n🎉🎉🎉🎉🎉" + allDate.Count+ " Total Date counrted");

            int totalCalories = workouts
                .Where(w => w != null)
                .Sum(w => (w?.caloriesBurnt) ?? 0);

            return totalCalories;
        }



    }


}