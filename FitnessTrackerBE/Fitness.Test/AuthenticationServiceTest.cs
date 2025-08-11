using System;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Services;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NUnit.Framework;

namespace FitnessTrackerAPI.Tests
{
    public class AuthenticationServiceTests
    {
        private Mock<ITokenService> _tokenServiceMock;
        private Mock<IEncryptionService> _encryptionServiceMock;
        private Mock<IRepository<string, User>> _userRepositoryMock;
        private Mock<ILogger<AuthenticationService>> _loggerMock;
        private AuthenticationService _service;

        [SetUp]
        public void Setup()
        {
            _tokenServiceMock = new Mock<ITokenService>();
            _encryptionServiceMock = new Mock<IEncryptionService>();
            _userRepositoryMock = new Mock<IRepository<string, User>>();
            _loggerMock = new Mock<ILogger<AuthenticationService>>();

            _service = new AuthenticationService(
                _tokenServiceMock.Object,
                _encryptionServiceMock.Object,
                _userRepositoryMock.Object,
                _loggerMock.Object
            );
        }

        [Test]
        public async Task Login_ReturnsUserLoginResponse_WhenCredentialsAreValid()
        {
            // Arrange
            var userRequest = new UserLoginRequest { Username = "test@example.com", Password = "password" };
            var dbUser = new User { Email = "test@example.com", Password = System.Text.Encoding.UTF8.GetBytes("hashedPassword") };
            _userRepositoryMock.Setup(r => r.Get(userRequest.Username)).ReturnsAsync(dbUser);
            _encryptionServiceMock.Setup(e => e.Verify(userRequest.Password, dbUser.Password)).Returns(true);
            _tokenServiceMock.Setup(t => t.GenerateToken(dbUser)).ReturnsAsync("jwt-token");

            // Act
            var result = await _service.Login(userRequest);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Username, Is.EqualTo("test@example.com"));
            Assert.That(result.Token, Is.EqualTo("jwt-token"));
        }

        [Test]
        public void Login_ThrowsException_WhenUserNotFound()
        {
            // Arrange
            var userRequest = new UserLoginRequest { Username = "notfound@example.com", Password = "password" };
            _userRepositoryMock.Setup(r => r.Get(userRequest.Username)).ReturnsAsync((User)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _service.Login(userRequest));
            Assert.That(ex.Message, Is.EqualTo("No such user"));
        }

        [Test]
        public void Login_ThrowsException_WhenPasswordInvalid()
        {
            // Arrange
            var userRequest = new UserLoginRequest { Username = "test@example.com", Password = "wrongpassword" };
            var dbUser = new User { Email = "test@example.com", Password = System.Text.Encoding.UTF8.GetBytes("hashedPassword") };
            _userRepositoryMock.Setup(r => r.Get(userRequest.Username)).ReturnsAsync(dbUser);
            _encryptionServiceMock.Setup(e => e.Verify(userRequest.Password, dbUser.Password)).Returns(false);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _service.Login(userRequest));
            Assert.That(ex.Message, Is.EqualTo("Invalid password"));
        }
         [Test]
        public async Task RefreshToken_ReturnsNewTokens_WhenValid()
        {
            // Arrange
            var userEmail = "test@example.com";
            var oldRefreshToken = "old-refresh-token";
            var request = new TokenRefreshRequest
            {
                AccessToken = "expired-access-token",
                RefreshToken = oldRefreshToken
            };

            var user = new User
            {
                Email = userEmail,
                RefreshToken = oldRefreshToken,
                RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(10)
            };

            var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userEmail) };
            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);

            _tokenServiceMock.Setup(x => x.GetPrincipalFromExpiredToken(request.AccessToken)).Returns(principal);
            _userRepositoryMock.Setup(x => x.Get(userEmail)).ReturnsAsync(user);
            _tokenServiceMock.Setup(x => x.GenerateToken(user)).ReturnsAsync("new-access-token");
            _tokenServiceMock.Setup(x => x.GenerateRefreshToken()).Returns("new-refresh-token");

            // Act
            var response = await _service.RefreshToken(request);

            // Assert
            Assert.That(response, Is.Not.Null);
            Assert.That(response.Username, Is.EqualTo(userEmail));
            Assert.That(response.Token, Is.EqualTo("new-access-token"));
            Assert.That(response.RefreshToken, Is.EqualTo("new-refresh-token"));
        }

        [Test]
        public void RefreshToken_ThrowsException_WhenInvalidToken()
        {
            // Arrange
            var request = new TokenRefreshRequest { AccessToken = null, RefreshToken = null };

            // Act & Assert
            var ex = Assert.ThrowsAsync<SecurityTokenException>(() => _service.RefreshToken(request));
            Assert.That(ex.Message, Is.EqualTo("Invalid token"));
        }

        [Test]
        public void RefreshToken_ThrowsException_WhenUserNotFound()
        {
            // Arrange
            var request = new TokenRefreshRequest
            {
                AccessToken = "expired-access-token",
                RefreshToken = "some-refresh-token"
            };

            var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "unknown@example.com") };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));

            _tokenServiceMock.Setup(x => x.GetPrincipalFromExpiredToken(request.AccessToken)).Returns(principal);
            _userRepositoryMock.Setup(x => x.Get(It.IsAny<string>())).ReturnsAsync((User)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<SecurityTokenException>(() => _service.RefreshToken(request));
            Assert.That(ex.Message, Is.EqualTo("Invalid refresh token"));
        }

        [Test]
        public void RefreshToken_ThrowsException_WhenTokenExpired()
        {
            // Arrange
            var userEmail = "test@example.com";
            var request = new TokenRefreshRequest
            {
                AccessToken = "expired-access-token",
                RefreshToken = "old-refresh-token"
            };

            var user = new User
            {
                Email = userEmail,
                RefreshToken = request.RefreshToken,
                RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(-1)
            };

            var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userEmail) };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));

            _tokenServiceMock.Setup(x => x.GetPrincipalFromExpiredToken(request.AccessToken)).Returns(principal);
            _userRepositoryMock.Setup(x => x.Get(userEmail)).ReturnsAsync(user);

            // Act & Assert
            var ex = Assert.ThrowsAsync<SecurityTokenException>(() => _service.RefreshToken(request));
            Assert.That(ex.Message, Is.EqualTo("Invalid refresh token"));
        }
    }
}