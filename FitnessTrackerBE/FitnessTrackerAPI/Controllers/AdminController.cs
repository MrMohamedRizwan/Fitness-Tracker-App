using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FirstAPI.Models.DTOs;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using FitnessTrackerAPI.Misc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace FitnessTrackerAPI.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    [CustomExceptionFilter]

    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }
        [HttpPost]
        public async Task<ActionResult<SignUpResponseDTO>> PostCoach([FromBody] UserDTO admin)
        {
            try
            {
                var newAdmin = await _adminService.AddAdminAsync(admin);
                if (newAdmin != null)
                    return Created("", newAdmin);
                return BadRequest("Unable to process request at this moment");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("Delete-Coach/{id}")]
        public async Task<IActionResult> DeleteCoachById(Guid id)
        {
            try
            {
                var success = await _adminService.DeleteUserAsync(id);
                if (success)
                    return Ok(new { Message = $"coach '{id}' deleted successfully" });
                return NotFound(new { Message = "coach not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }

        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("Delete-Client/{id}")]
        public async Task<IActionResult> DeleteClientById(Guid id)
        {
            try
            {
                var success = await _adminService.DeleteClientUserAsync(id);
                if (success)
                    return Ok(new { Message = $"Client '{id}' deleted successfully" });
                return NotFound(new { Message = "Client not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }

        }
    }
}