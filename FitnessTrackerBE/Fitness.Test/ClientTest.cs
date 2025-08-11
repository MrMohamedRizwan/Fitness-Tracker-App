using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Interfaces;
// using static FitnessTrackerAPI.Models.DTOs.EncryptResponseModel;
using NUnit.Framework;


namespace FitnessTrackerAPI.Tests
{
    public class ClientServiceTests
    {
        private ClientService _service;
        private FitnessDBContext _dbContext;

        private Mock<IMapper> _mapperMock;
        private Mock<IEncryptionService> _encryptionServiceMock;
        private Mock<IRepository<string, User>> _userRepositoryMock;
        private Mock<IRepository<Guid, Client>> _clientRepositoryMock;
        private Mock<IRepository<Guid, PlanAssignment>> _planAssignmentRepositoryMock;
        private Mock<IRepository<Guid, WorkoutPlan>> _workoutPlanRepositoryMock;
        private Mock<IRepository<Guid, DietPlan>> _dietPlanRepositoryMock;
        private Mock<ITokenService> _tokenServiceMock;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<FitnessDBContext>()
                .UseInMemoryDatabase(databaseName: $"FitnessDb_{Guid.NewGuid()}")
                .Options;

            _dbContext = new FitnessDBContext(options);

            _mapperMock = new Mock<IMapper>();
            _encryptionServiceMock = new Mock<IEncryptionService>();
            _userRepositoryMock = new Mock<IRepository<string, User>>();
            _clientRepositoryMock = new Mock<IRepository<Guid, Client>>();
            _planAssignmentRepositoryMock = new Mock<IRepository<Guid, PlanAssignment>>();
            _workoutPlanRepositoryMock = new Mock<IRepository<Guid, WorkoutPlan>>();
            _dietPlanRepositoryMock = new Mock<IRepository<Guid, DietPlan>>();
            _tokenServiceMock = new Mock<ITokenService>();

            _service = new ClientService(
                _mapperMock.Object,
                _encryptionServiceMock.Object,
                _userRepositoryMock.Object,
                _clientRepositoryMock.Object,
                _planAssignmentRepositoryMock.Object,
                _workoutPlanRepositoryMock.Object,
                // _tokenServiceMock.Object,
                _dietPlanRepositoryMock.Object,
                _tokenServiceMock.Object,
                _dbContext
            );
        }

        [TearDown]
        public void TearDown()
        {
            _dbContext.Dispose();
        }

        [Test]
        public async Task AddCoach_Should_Add_Client_When_Valid()
        {
            // Arrange
            var clientDto = new ClientAddRequestDTO { Email = "test@example.com", Password = "1234" };
            var user = new User { Email = clientDto.Email, Role = "Client" };
            var client = new Client { Id = Guid.NewGuid(), Email = clientDto.Email };

            _userRepositoryMock.Setup(repo => repo.Get(clientDto.Email)).ReturnsAsync((User)null);
            _mapperMock.Setup(m => m.Map<ClientAddRequestDTO, User>(It.IsAny<ClientAddRequestDTO>())).Returns(user);
            _mapperMock.Setup(m => m.Map<ClientAddRequestDTO, Client>(It.IsAny<ClientAddRequestDTO>())).Returns(client);
            _encryptionServiceMock.Setup(e => e.EncryptData(It.IsAny<EncryptModel>()))
                                            .ReturnsAsync(new EncryptModel { Data = "encryptedPwd" });
            _userRepositoryMock.Setup(repo => repo.Add(It.IsAny<User>())).ReturnsAsync(user);
            _clientRepositoryMock.Setup(repo => repo.Add(It.IsAny<Client>())).ReturnsAsync(client);

            // Act
            var result = await _service.AddCoach(clientDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Email, Is.EqualTo(client.Email));
        }

        [Test]
        public void AddClient_Should_Throw_When_User_AlreadyExists()
        {
            // Arrange
            var clientDto = new ClientAddRequestDTO { Email = "exissts@example.com", Password = "pass" };
            _userRepositoryMock.Setup(repo => repo.Get(clientDto.Email)).ReturnsAsync(new User());

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _service.AddCoach(clientDto));
            Assert.That(ex.Message, Is.EqualTo("User already exists"));
        }

        [Test]
        public async Task GetAssignedPlansForClient_Should_Return_AssignedPlans()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserId", clientId.ToString())
            }));

            var assignment = new PlanAssignment
            {
                Id = Guid.NewGuid(),
                ClientId = clientId,
                DietPlanId = Guid.NewGuid(),
                WorkoutPlanId = Guid.NewGuid()
            };

            var workoutPlan = new WorkoutPlan { Title = "Workout A" };
            var dietPlan = new DietPlan { DietTitle = "Keto Diet" };

            _planAssignmentRepositoryMock.Setup(r => r.GetAll()).ReturnsAsync(new List<PlanAssignment> { assignment });
            _workoutPlanRepositoryMock.Setup(r => r.Get(assignment.WorkoutPlanId.Value)).ReturnsAsync(workoutPlan);
            _dietPlanRepositoryMock.Setup(r => r.Get(assignment.DietPlanId.Value)).ReturnsAsync(dietPlan);

            // Act
            var result = await _service.GetAssignedPlansForClient(claimsPrincipal);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result[0].WorkoutPlanTitle, Is.EqualTo("Workout A"));
            Assert.That(result[0].DietPlanTitle, Is.EqualTo("Keto Diet"));
        }
    }
}
