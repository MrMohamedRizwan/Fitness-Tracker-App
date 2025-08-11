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
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using Moq;
using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using FitnessTrackerAPI.Services;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Context;
using Microsoft.EntityFrameworkCore;


namespace FitnessTrackerAPI.Tests
{
    public class DietPlanServiceTests
    {
        private Mock<IRepository<string, User>> _userRepoMock;
        private Mock<IEncryptionService> _encryptionServiceMock;
        private Mock<IRepository<Guid, Coach>> _coachRepoMock;
        private Mock<IRepository<Guid, DietMeal>> _dietMealRepoMock;
        private Mock<IRepository<Guid, DietPlan>> _dietPlanRepoMock;
        private Mock<IRepository<Guid, WorkoutPlan>> _workoutPlanRepoMock;
        private Mock<IRepository<Guid, WorkoutExercise>> _workoutExerciseRepoMock;
        private Mock<IRepository<Guid, PlanAssignment>> _planAssignmentRepoMock;
        private Mock<IRepository<Guid, Client>> _clientRepoMock;
        private IMapper _mapper;
        private DietPlanService _service;
        private FitnessDBContext _context;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<FitnessDBContext>()
                .UseInMemoryDatabase(databaseName: "DietPlanTestDb")
                .Options;
            _context = new FitnessDBContext(options);

            _userRepoMock = new Mock<IRepository<string, User>>();
            _encryptionServiceMock = new Mock<IEncryptionService>();
            _coachRepoMock = new Mock<IRepository<Guid, Coach>>();
            _dietMealRepoMock = new Mock<IRepository<Guid, DietMeal>>();
            _dietPlanRepoMock = new Mock<IRepository<Guid, DietPlan>>();
            _workoutPlanRepoMock = new Mock<IRepository<Guid, WorkoutPlan>>();
            _workoutExerciseRepoMock = new Mock<IRepository<Guid, WorkoutExercise>>();
            _planAssignmentRepoMock = new Mock<IRepository<Guid, PlanAssignment>>();
            _clientRepoMock = new Mock<IRepository<Guid, Client>>();

            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<DietPlanCreateRequestDTO, DietPlan>();
                cfg.CreateMap<DietMealDTO, DietMeal>();
            });
            _mapper = mapperConfig.CreateMapper();

            _service = new DietPlanService(
                _mapper,
                _encryptionServiceMock.Object,
                _userRepoMock.Object,
                _coachRepoMock.Object,
                _dietMealRepoMock.Object,
                _dietPlanRepoMock.Object,
                _workoutPlanRepoMock.Object,
                _workoutExerciseRepoMock.Object,
                _context,
                _planAssignmentRepoMock.Object,
                _clientRepoMock.Object
            );
        }

        private ClaimsPrincipal CreateClaimsPrincipal(Guid userId)
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserId", userId.ToString())
            }, "mock"));
        }

        [Test]
        public void AddMeal_Should_Throw_When_Title_Exists()
        {
            // Arrange
            var coachId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(coachId);
            var dto = new DietPlanCreateRequestDTO
            {
                DietTitle = "Test",
                Meals = new List<DietMealCreateDTO>()
            };
            var existingPlan = new DietPlan { CoachId = coachId, DietTitle = "Test" };
            _dietPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<DietPlan> { existingPlan });

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _service.AddMeal(dto, user));
            Assert.That(ex.Message, Is.EqualTo("A diet plan with this title already exists. Choose a new title or edit the previous diet plan"));
        }

        [Test]
        public async Task GetAllDietPlansDTO_Returns_Correct_Data()
        {
            // Arrange
            var coachId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(coachId);
            var dietPlanId = Guid.NewGuid();
            var plans = new List<DietPlan>
            {
                new DietPlan { Id = dietPlanId, CoachId = coachId, DietTitle = "Plan 1" }
            };
            var meals = new List<DietMeal>
            {
                new DietMeal { Id = Guid.NewGuid(), DietPlanId = dietPlanId, MealType = "Breakfast", Description = "Oats", Calories = 200, ProteinGrams = 10, CarbsGrams = 30, FatGrams = 5 }
            };

            _dietPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(plans);
            _dietMealRepoMock.Setup(r => r.GetAll()).ReturnsAsync(meals);

            // Act
            var result = await _service.GetAllDietPlansDTO(user,1,1);

            // Assert
            // Assert.That(result.Count, Is.EqualTo(1));
            Assert.That(result.Items[0].DietTitle, Is.EqualTo("Plan 1"));
            Assert.That(result.Items[0].MealTypes.Count, Is.EqualTo(1));
            Assert.That(result.Items[0].MealTypes[0].MealType, Is.EqualTo("Breakfast"));
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }
    }
}
