using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Misc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTrackerAPI.Controllers
{


    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    [CustomExceptionFilter]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;

        public ProgressController(IProgressService progressService)
        {
            _progressService = progressService;
        }

        // POST: api/v1/progress
        [Authorize(Roles = "Client")]
        [HttpPost("progress")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProgress([FromForm] ProgressCreateDTO dto)
        {
            try
            {
                var result = await _progressService.AddProgressAsync(dto, User);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("my")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetMyProgress()
        {
            var progress = await _progressService.GetMyProgressAsync(User);
            return Ok(progress);
        }

        // GET: api/v1/progress/client/{clientId}
        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Coach")]
        public async Task<IActionResult> GetProgressForClient(Guid clientId)
        {
            var progress = await _progressService.GetProgressByClientIdAsync(clientId, User);
            return Ok(progress);
        }

        [HttpGet("getProgressLogs/{clientId}")]
        [Authorize]
        public async Task<IActionResult> GetProgressLog(Guid clientId)
        {
            var progress = await _progressService.GetProgressGraphByClientId(clientId);
            return Ok(progress);
        }
    }

}