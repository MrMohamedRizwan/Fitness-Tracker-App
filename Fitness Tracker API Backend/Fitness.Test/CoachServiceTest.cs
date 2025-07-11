using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTO;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Services;
using FitnessTrackerAPI.Services.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;

namespace FitnessTrackerAPI.Tests
{
    public class CoachServiceTests
    {
        private CoachService _service;
        private FitnessDBContext _context;

        private Mock<IMapper> _mapperMock;
        private Mock<IEncryptionService> _encryptionServiceMock;
        private Mock<IRepository<string, User>> _userRepoMock;
        private Mock<IRepository<Guid, Coach>> _coachRepoMock;
        private Mock<IRepository<Guid, DietMeal>> _dietMealRepoMock;
        private Mock<IRepository<Guid, DietPlan>> _dietPlanRepoMock;
        private Mock<IRepository<Guid, WorkoutPlan>> _workoutPlanRepoMock;
        private Mock<IRepository<Guid, WorkoutExercise>> _workoutExerciseRepoMock;
        private Mock<IRepository<Guid, PlanAssignment>> _planAssignmentRepoMock;
        private Mock<IRepository<Guid, Client>> _clientRepoMock;
        private Mock<IHubContext<NotificationHub>> _hubContextMock;
        private Mock<IClientProxy> _clientProxyMock;
        private Mock<ITokenService> _tokenServiceMock;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<FitnessDBContext>()
                .UseInMemoryDatabase(databaseName: $"TestDB_{Guid.NewGuid()}")
                .Options;

            _context = new FitnessDBContext(options);

            _mapperMock = new Mock<IMapper>();
            _encryptionServiceMock = new Mock<IEncryptionService>();
            _userRepoMock = new Mock<IRepository<string, User>>();
            _coachRepoMock = new Mock<IRepository<Guid, Coach>>();
            _dietMealRepoMock = new Mock<IRepository<Guid, DietMeal>>();
            _dietPlanRepoMock = new Mock<IRepository<Guid, DietPlan>>();
            _workoutPlanRepoMock = new Mock<IRepository<Guid, WorkoutPlan>>();
            _workoutExerciseRepoMock = new Mock<IRepository<Guid, WorkoutExercise>>();
            _planAssignmentRepoMock = new Mock<IRepository<Guid, PlanAssignment>>();
            _clientRepoMock = new Mock<IRepository<Guid, Client>>();
            _tokenServiceMock = new Mock<ITokenService>();

            _clientProxyMock = new Mock<IClientProxy>();
            var clientsMock = new Mock<IHubClients>();
            clientsMock.Setup(c => c.Group(It.IsAny<string>())).Returns(_clientProxyMock.Object);
            _hubContextMock = new Mock<IHubContext<NotificationHub>>();
            _hubContextMock.Setup(h => h.Clients).Returns(clientsMock.Object);

            _service = new CoachService(
                _mapperMock.Object,
                _encryptionServiceMock.Object,
                _userRepoMock.Object,
                _coachRepoMock.Object,
                _dietMealRepoMock.Object,
                _dietPlanRepoMock.Object,
                _workoutPlanRepoMock.Object,
                _workoutExerciseRepoMock.Object,
                _context,
                _planAssignmentRepoMock.Object,
                _clientRepoMock.Object,
                _hubContextMock.Object,
                _tokenServiceMock.Object
            );
        }

        [Test]
        public async Task AddCoach_Should_Add_NewCoach_When_Valid()
        {
            var dto = new CoachAddRequestDTO { Email = "test@coach.com", Password = "pass123" };
            var user = new User { Email = dto.Email };
            var coach = new Coach { Email = dto.Email, Id = Guid.NewGuid() };

            _userRepoMock.Setup(r => r.Get(dto.Email)).ReturnsAsync((User)null);
            _mapperMock.Setup(m => m.Map<CoachAddRequestDTO, User>(dto)).Returns(user);
            _mapperMock.Setup(m => m.Map<CoachAddRequestDTO, Coach>(dto)).Returns(coach);
            _encryptionServiceMock.Setup(e => e.EncryptData(It.IsAny<EncryptModel>()))
                .ReturnsAsync(new EncryptModel { EncryptedData = System.Text.Encoding.UTF8.GetBytes("hashed123") });
            _userRepoMock.Setup(r => r.Add(It.IsAny<User>())).ReturnsAsync(user);
            _coachRepoMock.Setup(r => r.Add(It.IsAny<Coach>())).ReturnsAsync(coach);
            _tokenServiceMock.Setup(t => t.GenerateToken(It.IsAny<User>())).ReturnsAsync("token123");
            _tokenServiceMock.Setup(t => t.GenerateRefreshToken()).Returns("refresh123");

            var result = await _service.AddCoach(dto);

            Assert.That(result.Email, Is.EqualTo(dto.Email));
            Assert.That(result.Token, Is.EqualTo("token123"));
        }

        [Test]
        public void AddCoach_Should_Throw_When_Email_Exists()
        {
            var dto = new CoachAddRequestDTO { Email = "existing@coach.com", Password = "abc" };
            _userRepoMock.Setup(r => r.Get(dto.Email)).ReturnsAsync(new User());

            var ex = Assert.ThrowsAsync<Exception>(() => _service.AddCoach(dto));
            Assert.That(ex.Message, Is.EqualTo("User Already Exist"));
        }

        [Test]
        public async Task AssignPlanToClient_Should_Assign_Plan()
        {
            var coachId = Guid.NewGuid();
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserId", coachId.ToString())
            }));

            var client = new Client { Id = Guid.NewGuid(), Email = "client@mail.com", CoachId = coachId };
            var workoutPlan = new WorkoutPlan { Id = Guid.NewGuid(), CoachId = coachId, Title = "WP" };
            var dietPlan = new DietPlan { Id = Guid.NewGuid(), CoachId = coachId, DietTitle = "DP" };

            _clientRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<Client> { client });
            _workoutPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<WorkoutPlan> { workoutPlan });
            _dietPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<DietPlan> { dietPlan });
            _planAssignmentRepoMock.Setup(r => r.Add(It.IsAny<PlanAssignment>()))
                .ReturnsAsync((PlanAssignment p) => p);

            var result = await _service.AssignPlanToClient(new FirstAPI.Models.DTOs.PlanAssignmentRequestDTO
            {
                ClientEmail = client.Email,
                WorkoutName = workoutPlan.Title,
                DietPlanName = dietPlan.DietTitle
            }, user);

            Assert.That(result.ClientId, Is.EqualTo(client.Id));
            Assert.That(result.WorkoutPlanId, Is.EqualTo(workoutPlan.Id));
            Assert.That(result.DietPlanId, Is.EqualTo(dietPlan.Id));
        }

        [Test]
        public async Task GetAssignedPlans_Should_Return_PlanNames()
        {
            var coachId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var email = "client@fit.com";

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserId", coachId.ToString())
            }));

            var client = new Client { Id = clientId, Email = email, CoachId = coachId };
            var assignment = new PlanAssignment
            {
                ClientId = clientId,
                WorkoutPlanId = Guid.NewGuid(),
                DietPlanId = Guid.NewGuid(),
                Id = Guid.NewGuid(),
                CompletionStatus = "In Progress"
            };

            _clientRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<Client> { client });
            _planAssignmentRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<PlanAssignment> { assignment });
            _workoutPlanRepoMock.Setup(r => r.Get(assignment.WorkoutPlanId.Value))
                .ReturnsAsync(new WorkoutPlan { Title = "WP" });
            _dietPlanRepoMock.Setup(r => r.Get(assignment.DietPlanId.Value))
                .ReturnsAsync(new DietPlan { DietTitle = "DP" });

            var result = await _service.GetAssignedPlans(email, user);

            Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result[0].WorkoutPlanTitle, Is.EqualTo("WP"));
            Assert.That(result[0].DietPlanTitle, Is.EqualTo("DP"));
            Assert.That(result[0].status, Is.EqualTo("In Progress"));
        }

        [Test]
        public async Task MarkPlanAsCompletedAsync_Should_Update_CompletionStatus()
        {
            var coachId = Guid.NewGuid();
            var planId = Guid.NewGuid();
            var assignment = new PlanAssignment
            {
                Id = planId,
                AssignedByCoachId = coachId,
                CompletionStatus = "Pending"
            };

            _context.PlanAssignment.Add(assignment);
            _context.SaveChanges();

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserId", coachId.ToString())
            }));

            var result = await _service.MarkPlanAsCompletedAsync(planId, user);

            var updated = await _context.PlanAssignment.FindAsync(planId);

            Assert.That(result, Is.True);
            Assert.That(updated.CompletionStatus, Is.EqualTo("Completed"));
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }
    }
}
