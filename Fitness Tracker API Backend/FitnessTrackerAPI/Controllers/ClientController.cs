using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTrackerAPI.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;
        public ClientController(IClientService clientService)
        {
            _clientService = clientService;
        }
        [HttpPost]
        public async Task<ActionResult<SignUpResponseDTO>> PostClient([FromBody] ClientAddRequestDTO coach)
        {
            try
            {
                var newCoach = await _clientService.AddCoach(coach);
                if (newCoach != null)
                    return Created("", newCoach);
                return BadRequest("Unable to process request at this moment");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        [Authorize]
        [HttpGet("getAllClients")]
        public async Task<IActionResult> GetAllClients([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var coaches = await _clientService.GetAllClientsAsync(pageNumber, pageSize);
                return Ok(coaches);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [Authorize(Roles = "Client")]
        [HttpGet("assigned-plans")]
        public async Task<IActionResult> GetAssignedPlans()
        {
            try
            {
                var result = await _clientService.GetAssignedPlansForClient(User);
                if (result == null)
                    return NotFound(new { Message = "No assigned plans found." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
        [Authorize]
        [HttpGet("get-client/{clientId}")]
        public async Task<IActionResult> GetClientById(Guid clientId)
        {
            try
            {
                var result = await _clientService.GetClientById(clientId);
                if (result == null)
                    return NotFound(new { Message = "Client not found." });

                return Ok(new { Message = result });
            }
            catch (Exception ex)
            {

                return BadRequest(new { Error = ex.Message });
            }
        }

        [Authorize(Roles = "Client")]
        [HttpGet("my-details")]
        public async Task<IActionResult> MyDetails()
        {
            System.Console.WriteLine("\n\n\nMY DETAILS ----------------\n\n");
            try
            {
                var result = await _clientService.GetMyDetails(User);
                if (result == null)
                    return NotFound(new { Message = "Client not found." });

                return Ok(new { Message = result });
            }
            catch (Exception ex)
            {

                return BadRequest(new { Error = ex.Message });
            }
        }

        [Authorize(Roles = "Client")]
        [HttpPut("update-client-details")]
        public async Task<IActionResult> UpdateClientDetails([FromBody] ClientUpdateRequestDTO clientUpdate)
        {
            try
            {
                var result = await _clientService.UpdateClientDetails(User, clientUpdate);
                if (result == null)
                    return NotFound(new { Message = "Client not found." });

                return Ok(new { Message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
        [Authorize]
        [HttpPut("UpdateStatus")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> MarkAsCompleted(UpdateStatusDTO dto)
        {
            try
            {
                ; // extract from JWT token
                await _clientService.UpdatePlanStatus(dto.PlanAssignmentID, User,dto.status);
                return Ok(new { Message = "Plan Status Updated." });
            }
            catch (UnauthorizedAccessException e)
            {
                return Forbid(e.Message);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

    }
}