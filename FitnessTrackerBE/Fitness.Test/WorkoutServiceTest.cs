using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Services;
using Moq;
using NUnit.Framework;

namespace FitnessTrackerAPI.Tests
{
    public class WorkoutServiceTests
    {
        private Mock<IRepository<Guid, Workout>> _workoutRepoMock;
        private Mock<IRepository<Guid, Client>> _clientRepoMock;
        private Mock<IRepository<Guid, PlanAssignment>> _planAssignmentRepoMock;
        private WorkoutService _service;

        [SetUp]
        public void Setup()
        {
            _workoutRepoMock = new Mock<IRepository<Guid, Workout>>();
            _clientRepoMock = new Mock<IRepository<Guid, Client>>();
            _planAssignmentRepoMock = new Mock<IRepository<Guid, PlanAssignment>>();

            _service = new WorkoutService(
                _workoutRepoMock.Object,
                _clientRepoMock.Object,
                _planAssignmentRepoMock.Object
            );
        }

        private ClaimsPrincipal CreateClaimsPrincipal(Guid userId, string role = "Client")
        {
            var claims = new List<Claim>
            {
                new Claim("UserId", userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "mock");
            return new ClaimsPrincipal(identity);
        }

        [Test]
        public async Task AddWorkout_Should_Add_And_Return_WorkoutResponseDTO_When_Valid()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var planAssignmentId = Guid.NewGuid();
            var dto = new WorkoutCreateDTO { PlanAssignmentId = planAssignmentId, Description = "Test workout" };
            var user = CreateClaimsPrincipal(clientId);

            var planAssignment = new PlanAssignment { Id = planAssignmentId, ClientId = clientId };
            _planAssignmentRepoMock.Setup(r => r.Get(planAssignmentId)).ReturnsAsync(planAssignment);
            _workoutRepoMock.Setup(r => r.Add(It.IsAny<Workout>())).ReturnsAsync((Workout w) => w);

            // Act
            var result = await _service.AddWorkout(dto, user);

            // Assert
            Assert.That(result,Is.Not.Null);
            Assert.That(clientId, Is.EqualTo(result.ClientId));
            Assert.That(planAssignmentId, Is.EqualTo(result.PlanAssignmentId));
            Assert.That("Test workout", Is.EqualTo(result.Description));
        }

        [Test]
        public void AddWorkout_Should_Throw_When_Invalid_ClientId()
        {
            // Arrange
            var dto = new WorkoutCreateDTO { PlanAssignmentId = Guid.NewGuid(), Description = "Test workout" };
            var user = new ClaimsPrincipal(); // No claims

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.AddWorkout(dto, user));
        }

        // [Test]
        // public void AddWorkout_Should_Throw_When_Invalid_PlanAssignment()
        // {
        //     // Arrange
        //     var clientId = Guid.NewGuid();
        //     var planAssignmentId = Guid.NewGuid();
        //     var dto = new WorkoutCreateDTO { PlanAssignmentId = planAssignmentId, Description = "Test workout" };
        //     var user = CreateClaimsPrincipal(clientId);

        //     _planAssignmentRepoMock.Setup(r => r.Get(planAssignmentId)).ReturnsAsync((PlanAssignment)null);

        //     // Act & Assert
        //     Assert.ThrowsAsync<InvalidOperationException>(() => _service.AddWorkout(dto, user));
        // }

        [Test]
        public async Task GetWorkoutById_Should_Return_WorkoutResponseDTO_When_Authorized()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId, "Client");
            var workout = new Workout
            {
                Id = workoutId,
                ClientId = clientId,
                PlanAssignmentId = Guid.NewGuid(),
                Date = DateTime.UtcNow,
                Description = "Test workout"
            };
            _workoutRepoMock.Setup(r => r.Get(workoutId)).ReturnsAsync(workout);

            // Act
            var result = await _service.GetWorkoutById(workoutId, user);

            // Assert
            Assert.That(result,Is.Not.Null);
            Assert.That(workoutId,Is.EqualTo(result.Id));
            Assert.That(clientId,Is.EqualTo( result.ClientId));
        }

        [Test]
        public void GetWorkoutById_Should_Throw_When_Unauthorized_Client()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var otherClientId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId, "Client");
            var workout = new Workout
            {
                Id = workoutId,
                ClientId = otherClientId,
                PlanAssignmentId = Guid.NewGuid(),
                Date = DateTime.UtcNow,
                Description = "Test workout"
            };
            _workoutRepoMock.Setup(r => r.Get(workoutId)).ReturnsAsync(workout);

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.GetWorkoutById(workoutId, user));
        }

        [Test]
        public async Task GetWorkoutById_Should_Return_Null_When_NotFound()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId, "Client");
            _workoutRepoMock.Setup(r => r.Get(workoutId)).ReturnsAsync((Workout)null);

            // Act
            var result = await _service.GetWorkoutById(workoutId, user);

            // Assert
            Assert.That(result,Is.Null);
        }

        [Test]
        public async Task GetWorkoutsForCurrentClient_Returns_Workouts()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId);
            var workouts = new List<Workout>
            {
                new Workout { Id = Guid.NewGuid(), ClientId = clientId, Description = "W1", PlanAssignmentId = Guid.NewGuid(), Date = DateTime.UtcNow },
                new Workout { Id = Guid.NewGuid(), ClientId = Guid.NewGuid(), Description = "W2", PlanAssignmentId = Guid.NewGuid(), Date = DateTime.UtcNow }
            };
            _workoutRepoMock.Setup(r => r.GetAll()).ReturnsAsync(workouts);

            // Act
            var result = (await _service.GetWorkoutsForCurrentClient(user)).ToList();

            // Assert
            Assert.That(result.Count,Is.EqualTo(1));
            Assert.That(result[0].ClientId,Is.EqualTo(clientId));

        }

        [Test]
        public async Task GetWorkoutsByClientId_Returns_Workouts()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var workouts = new List<Workout>
            {
                new Workout { Id = Guid.NewGuid(), ClientId = clientId, Description = "W1", PlanAssignmentId = Guid.NewGuid(), Date = DateTime.UtcNow },
                new Workout { Id = Guid.NewGuid(), ClientId = Guid.NewGuid(), Description = "W2", PlanAssignmentId = Guid.NewGuid(), Date = DateTime.UtcNow }
            };
            _workoutRepoMock.Setup(r => r.GetAll()).ReturnsAsync(workouts);

            // Act
            var result = (await _service.GetWorkoutsByClientId(clientId)).ToList();

            // Assert
            Assert.That(result.Count,Is.EqualTo(1));
            Assert.That(result[0].ClientId,Is.EqualTo(clientId));
        }
    }
}