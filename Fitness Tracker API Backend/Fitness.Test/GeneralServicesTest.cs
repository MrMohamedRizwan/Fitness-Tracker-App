using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Services;
using Moq;
using NUnit.Framework;


namespace FitnessTrackerAPI.Tests
{
    public class GeneralServiceTests
    {
        private Mock<IRepository<Guid, DietPlan>> _dietPlanRepoMock;
        private Mock<IRepository<Guid, DietMeal>> _dietMealRepoMock;
        private Mock<IRepository<Guid, WorkoutPlan>> _workoutPlanRepoMock;
        private Mock<IRepository<Guid, WorkoutExercise>> _exerciseRepoMock;
        private GeneralService _service;

        [SetUp]
        public void Setup()
        {
            _dietPlanRepoMock = new Mock<IRepository<Guid, DietPlan>>();
            _dietMealRepoMock = new Mock<IRepository<Guid, DietMeal>>();
            _workoutPlanRepoMock = new Mock<IRepository<Guid, WorkoutPlan>>();
            _exerciseRepoMock = new Mock<IRepository<Guid, WorkoutExercise>>();

            _service = new GeneralService(
                _dietPlanRepoMock.Object,
                _dietMealRepoMock.Object,
                _workoutPlanRepoMock.Object,
                _exerciseRepoMock.Object
            );
        }

        [Test]
        public async Task GetDietPlanByTitle_ReturnsDietPlanResponse_WhenFound()
        {
            // Arrange
            var planId = Guid.NewGuid();
            var dietPlans = new List<DietPlan>
            {
                new DietPlan { Id = planId, DietTitle = "Keto" }
            };
            var dietMeals = new List<DietMeal>
            {
                new DietMeal { DietPlanId = planId, MealType = "Breakfast", Description = "Eggs", Calories = 300, ProteinGrams = 20, CarbsGrams = 5, FatGrams = 25 }
            };

            _dietPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(dietPlans);
            _dietMealRepoMock.Setup(r => r.GetAll()).ReturnsAsync(dietMeals);

            // Act
            var result = await _service.GetDietPlanByTitle("Keto");

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That( result.DietTitle,Is.EqualTo("Keto"));
            Assert.That(result.MealTypes.Count, Is.EqualTo(1));
            Assert.That(result.MealTypes[0].MealType, Is.EqualTo("Breakfast"));
        }

        [Test]
        public async Task GetDietPlanByTitle_ReturnsNull_WhenNotFound()
        {
            // Arrange
            _dietPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<DietPlan>());

            // Act
            var result = await _service.GetDietPlanByTitle("Unknown");

            // Assert
            Assert.That(result, Is.Null);;
        }

        [Test]
        public async Task GetWorkouttPlanByTitle_ReturnsWorkoutPlanResponse_WhenFound()
        {
            // Arrange
            var planId = Guid.NewGuid();
            var workoutPlans = new List<WorkoutPlan>
            {
                new WorkoutPlan { Id = planId, Title = "Push Day", Description = "Push workout", DurationInWeeks = 4 }
            };
            var exercises = new List<WorkoutExercise>
            {
                new WorkoutExercise { Id = Guid.NewGuid(), WorkoutPlanId = planId, Name = "Bench Press", Sets = 4, Reps = 10, RestSeconds = 90, Notes = "Go heavy" }
            };

            _workoutPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(workoutPlans);
            _exerciseRepoMock.Setup(r => r.GetAll()).ReturnsAsync(exercises);

            // Act
            var result = await _service.GetWorkouttPlanByTitle("Push Day");

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo("Push Day"));
            Assert.That(result.Exercises.Count, Is.EqualTo(1));
            Assert.That(result.Exercises[0].Name, Is.EqualTo("Bench Press"));
        }

        [Test]
        public async Task GetWorkouttPlanByTitle_ReturnsNull_WhenNotFound()
        {
            // Arrange
            _workoutPlanRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<WorkoutPlan>());

            // Act
            var result = await _service.GetWorkouttPlanByTitle("Unknown");

            // Assert
            Assert.That(result, Is.Null);
        }
    }
}