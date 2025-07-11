using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using FitnessTrackerAPI.Misc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;

namespace FitnessTrackerAPI.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    [CustomExceptionFilter]

    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IOtpService _otpService;
        public AuthenticationController(IAuthenticationService authenticationService, IOtpService otpService)
        {
            _authenticationService = authenticationService;
            _otpService = otpService;
        }

        [HttpPost]

        public async Task<ActionResult<UserLoginResponse>> PostClient([FromBody] UserLoginRequest loginRequest)
        {
            var result = await _authenticationService.Login(loginRequest);
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] TokenRefreshRequest request)
        {
            try
            {
                var response = await _authenticationService.RefreshToken(request);
                return Ok(response);
            }
            catch (SecurityTokenException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }


        // [HttpPost("forgot-password")]
        // public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordreqDTO dto)
        // {
        //     try
        //     {
        //         await _otpService.SendOtpAsync(dto.Email);
        //         return Ok(new { message = "OTP sent to email." });
        //     }
        //     catch (Exception ex)
        //     {
        //         Console.WriteLine($"❌ Exception in forgot-password: {ex.Message}");
        //         return StatusCode(500, new { error = ex.Message });
        //     }
        // }

        // [HttpPost("verify-otp")]
        // public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        // {
        //     var isValid = await _otpService.VerifyOtpAsync(request.Email, request.Otp);
        //     return isValid ? Ok() : BadRequest(new { error = "Invalid or expired OTP" });
        // }

        // [HttpPost("reset-password")]
        // public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        // {
        //     await _userService.UpdatePasswordAsync(request.Email, request.NewPassword); // Use BCrypt
        //     return Ok(new { message = "Password reset successful." });
        // }

    }
}