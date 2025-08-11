using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Services;
using Moq;
using NUnit.Framework;

namespace FitnessTrackerAPI.Tests
{
    public class ProgressServiceTests
    {
        private Mock<IRepository<Guid, Progress>> _progressRepoMock;
        private Mock<IRepository<Guid, Client>> _clientRepoMock;
        private Mock<IRepository<Guid, PlanAssignment>> _planAssignmentRepoMock;
        private Mock<IAWSService> _awsServiceMock;
        private ProgressService _service;

        [SetUp]
        public void Setup()
        {
            _progressRepoMock = new Mock<IRepository<Guid, Progress>>();
            _clientRepoMock = new Mock<IRepository<Guid, Client>>();
            _planAssignmentRepoMock = new Mock<IRepository<Guid, PlanAssignment>>();
            _awsServiceMock = new Mock<IAWSService>();

            _service = new ProgressService(
                _progressRepoMock.Object,
                _clientRepoMock.Object,
                _planAssignmentRepoMock.Object,
                _awsServiceMock.Object
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

        // [Test]
        // public async Task AddProgressAsync_Should_Add_And_Return_ProgressResponseDTO_When_Valid()
        // {
        //     // Arrange
        //     var clientId = Guid.NewGuid();
        //     var dto = new ProgressCreateDTO
        //     {
        //         Height = 180,
        //         Weight = 75,
        //         ImageFile = new byte[] { 1, 2, 3 }
        //     };
        //     var user = CreateClaimsPrincipal(clientId);
        //     var client = new Client { Id = clientId };
        //     var objectKey = "s3-object-key";
        //     var preSignedUrl = "https://s3-url";

        //     _clientRepoMock.Setup(r => r.Get(clientId)).ReturnsAsync(client);
        //     _awsServiceMock.Setup(a => a.UploadFileAsync(dto.ImageFile, "progress-images")).ReturnsAsync(objectKey);
        //     _progressRepoMock.Setup(r => r.Add(It.IsAny<Progress>())).ReturnsAsync((Progress p) => p);
        //     _awsServiceMock.Setup(a => a.GeneratePreSignedURL(objectKey, 60)).Returns(preSignedUrl);

        //     // Act
        //     var result = await _service.AddProgressAsync(dto, user);

        //     // Assert
        //     Assert.IsNotNull(result);
        //     Assert.That(clientId, result.ClientId);
        //     Assert.That(preSignedUrl, result.ImagePath);
        //     Assert.That(180, result.Height);
        //     Assert.That(75, result.Weight);
        // }

        [Test]
        public void AddProgressAsync_Should_Throw_When_Invalid_ClientId()
        {
            // Arrange
            var dto = new ProgressCreateDTO();
            var user = new ClaimsPrincipal(); // No claims

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.AddProgressAsync(dto, user));
        }

        [Test]
        public void AddProgressAsync_Should_Throw_When_Client_Not_Found()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var dto = new ProgressCreateDTO();
            var user = CreateClaimsPrincipal(clientId);

            _clientRepoMock.Setup(r => r.Get(clientId)).ReturnsAsync((Client)null);

            // Act & Assert
            Assert.ThrowsAsync<InvalidOperationException>(() => _service.AddProgressAsync(dto, user));
        }

        [Test]
        public async Task GetProgressByClientIdAsync_AsCoach_Returns_Progress()
        {
            // Arrange
            var coachId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(coachId, "Coach");
            var assignments = new List<PlanAssignment>
            {
                new PlanAssignment { ClientId = clientId, AssignedByCoachId = coachId }
            };
            var progresses = new List<Progress>
            {
                new Progress { Id = Guid.NewGuid(), ClientId = clientId, Height = 180, Weight = 75, UploadedAt = DateTime.UtcNow }
            };

            _planAssignmentRepoMock.Setup(r => r.GetAll()).ReturnsAsync(assignments);
            _progressRepoMock.Setup(r => r.GetAll()).ReturnsAsync(progresses);

            // Act
            var result = (await _service.GetProgressByClientIdAsync(clientId, user)).ToList();

            // Assert
            Assert.That(1, Is.EqualTo(result.Count));
            Assert.That(clientId, Is.EqualTo(result[0].ClientId));
        }

        [Test]
        public void GetProgressByClientIdAsync_AsCoach_Throws_When_Not_Assigned()
        {
            // Arrange
            var coachId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(coachId, "Coach");
            _planAssignmentRepoMock.Setup(r => r.GetAll()).ReturnsAsync(new List<PlanAssignment>());

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.GetProgressByClientIdAsync(clientId, user));
        }

        [Test]
        public async Task GetProgressByClientIdAsync_AsClient_Returns_Progress()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId, "Client");
            var progresses = new List<Progress>
            {
                new Progress { Id = Guid.NewGuid(), ClientId = clientId, Height = 180, Weight = 75, UploadedAt = DateTime.UtcNow }
            };
            _progressRepoMock.Setup(r => r.GetAll()).ReturnsAsync(progresses);

            // Act
            var result = (await _service.GetProgressByClientIdAsync(clientId, user)).ToList();

            // Assert
            Assert.That(1, Is.EqualTo(result.Count));
            Assert.That(clientId, Is.EqualTo(result[0].ClientId));
        }

        [Test]
        public void GetProgressByClientIdAsync_AsClient_Throws_When_Accessing_Other_Client()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var otherClientId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId, "Client");

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.GetProgressByClientIdAsync(otherClientId, user));
        }

        [Test]
        public async Task GetMyProgressAsync_Returns_Progress()
        {
            // Arrange
            var clientId = Guid.NewGuid();
            var user = CreateClaimsPrincipal(clientId, "Client");
            var progresses = new List<Progress>
            {
                new Progress { Id = Guid.NewGuid(), ClientId = clientId, Height = 180, Weight = 75, UploadedAt = DateTime.UtcNow }
            };
            _progressRepoMock.Setup(r => r.GetAll()).ReturnsAsync(progresses);

            // Act
            var result = (await _service.GetMyProgressAsync(user)).ToList();

            // Assert
            Assert.That(1, Is.EqualTo(result.Count));
            Assert.That(clientId, Is.EqualTo(result[0].ClientId));
        }
    }
}