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

    public class CoachController : ControllerBase
    {
        private readonly ICoachService _coachService;
        public CoachController(ICoachService coachService)
        {
            _coachService = coachService;
        }
        [HttpPost]
        public async Task<ActionResult<SignUpResponseDTO>> PostCoach([FromBody] CoachAddRequestDTO coach)
        {
            try
            {
                var newCoach = await _coachService.AddCoach(coach);
                if (newCoach != null)
                    return Created("", newCoach);
                return BadRequest("Unable to process request at this moment");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        [Authorize(Roles = "Coach")]
        [HttpDelete("Delete-Assigned-Plans/{id}")]
        public async Task<IActionResult> DeleteCoachById(Guid id)
        {
            try
            {
                var success = await _coachService.DeletePlanAsync(id);
                if (success)
                    return Ok(new { Message = $"Plan '{id}' deleted successfully" });
                return NotFound(new { Message = "Plan not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }

        }

        // [Authorize(Roles = "Coach")]
        // [HttpPost("AddDiet")]
        // public async Task<ActionResult<DietPlan>> CreateDiet([FromBody] DietPlanCreateRequestDTO diet)
        // {
        //     try
        //     {
        //         var newMeal = await _coachService.AddMeal(diet, User);
        //         if (newMeal != null)
        //             return Created("", newMeal);
        //         return BadRequest("Unable to process request at this moment");
        //     }
        //     catch (Exception e)
        //     {
        //         return BadRequest(e.Message);
        //     }
        // }
        // [Authorize(Roles = "Coach")]
        // [HttpPut("Edit-Diet/{title}")]
        // public async Task<IActionResult> UpdateDietByTitle(string title, [FromBody] DietPlanCreateRequestDTO dto)
        // {
        //     try
        //     {
        //         var updatedPlan = await _coachService.UpdateDietPlanByTitle(title, dto, User);
        //         return Ok(new
        //         {
        //             Message = "Diet plan updated successfully",
        //             PlanId = updatedPlan.Id,
        //             Title = updatedPlan.DietTitle,
        //             Meals = updatedPlan.Meals?.Select(m => new
        //             {
        //                 m.MealType,
        //                 m.Description,
        //                 m.Calories,
        //                 m.ProteinGrams,
        //                 m.CarbsGrams,
        //                 m.FatGrams
        //             })
        //         });
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { Error = ex.Message });
        //     }
        // }
        // [Authorize(Roles = "Coach")]
        // [HttpDelete("Delete-Diet/{title}")]
        // public async Task<IActionResult> DeleteDietByTitle(string title)
        // {
        //     try
        //     {
        //         var success = await _coachService.DeleteDietPlanByTitle(title, User);
        //         if (success)
        //             return Ok(new { Message = $"Diet plan '{title}' deleted successfully" });
        //         return NotFound(new { Message = "Diet plan not found" });
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { Error = ex.Message });
        //     }

        // }
        // [Authorize(Roles = "Coach")]
        // [HttpGet("diet/all")]
        // public async Task<IActionResult> GetAllDietPlans()
        // {
        //     try
        //     {
        //         var plans = await _coachService.GetAllDietPlansDTO(User);
        //         return Ok(plans);
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { Error = ex.Message });
        //     }
        // }

        // [HttpGet("dietplan/{title}")]
        // [Authorize(Roles = "Coach")]
        // public async Task<IActionResult> GetDietPlanByTitle(string title)
        // {
        //     var result = await _coachService.GetDietPlanByTitle(title, User);
        //     if (result == null)
        //         return NotFound(new { message = "Diet plan not found" });

        //     return Ok(result);
        // }

        // [Authorize(Roles = "Coach")]
        // [HttpPost("AddWorkoutPlans")]
        // public async Task<ActionResult<WorkoutPlan>> CreateWorkout([FromBody] WorkoutPlanCreateRequestDTO workout)
        // {
        //     try
        //     {
        //         var newWorkout = await _coachService.AddWorkoutPlan(workout, User);
        //         if (newWorkout != null)
        //             return Created("", newWorkout);
        //         return BadRequest("Unable to process request at this moment");
        //     }
        //     catch (Exception e)
        //     {
        //         return BadRequest(e.Message);
        //     }
        // }
        // [Authorize(Roles = "Coach")]
        // [HttpPut("EditWorkoutPlan/{title}")]
        // public async Task<IActionResult> UpdateWorkoutByTitle(string title, [FromBody] WorkoutPlanCreateRequestDTO dto)
        // {
        //     try
        //     {
        //         var updatedPlan = await _coachService.UpdateWorkoutPlanByTitle(title, dto, User);
        //         return Ok(new
        //         {
        //             Message = "Workout plan updated successfully",
        //             PlanId = updatedPlan.Id,
        //             Title = updatedPlan.Title,
        //             Workouts = updatedPlan.Exercises?.Select(m => new
        //             {
        //                 m.Name,
        //                 m.Notes,
        //                 m.Reps,
        //                 m.RestSeconds,
        //                 m.Sets,
        //             })
        //         });
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { Error = ex.Message });
        //     }
        // }

        // [HttpDelete("Delete-Workout/{title}")]
        // public async Task<IActionResult> DeleteWorkoutByTitle(string title)
        // {
        //     try
        //     {
        //         var success = await _coachService.DeleteWorkoutPlanByTitle(title, User);
        //         if (success)
        //             return Ok(new { Message = $"Workout plan '{title}' deleted successfully" });
        //         return NotFound(new { Message = "Workout plan not found" });
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { Error = ex.Message });
        //     }
        // }

        // [Authorize(Roles = "Coach")]
        // [HttpGet("workout/all")]
        // public async Task<IActionResult> GetAllWorkoutPlans()
        // {
        //     try
        //     {
        //         var plans = await _coachService.GetAllWorkoutPlansDTO(User);
        //         return Ok(plans);
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { Error = ex.Message });
        //     }
        // }

        // [HttpGet("Workoutplan/{title}")]
        // [Authorize(Roles = "Coach")]
        // public async Task<IActionResult> GetWorkoutPlanByTitle(string title)
        // {
        //     System.Console.WriteLine($"{title}💕");
        //     var result = await _coachService.GetWorkouttPlanByTitle(title, User);
        //     if (result == null)
        //         return NotFound(new { message = "Workout plan not found" });

        //     return Ok(result);
        // }

        [Authorize(Roles = "Coach")]
        [HttpPost("AssignPlan")]
        public async Task<IActionResult> AssignPlanToClient([FromBody] PlanAssignmentRequestDTO dto)
        {
            try
            {
                var assignment = await _coachService.AssignPlanToClient(dto, User);


                var response = assignment;

                return CreatedAtAction(nameof(AssignPlanToClient), new { id = response.Id }, new { message = "Plan Assigned to Client" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [Authorize(Roles = "Coach")]
        [HttpGet("getAssignedPlan/{clientEmail}")]
        public async Task<IActionResult> GetAssignedPlansForParticualrClient(string clientEmail)
        {
            var result = await _coachService.GetAssignedPlans(clientEmail, User);
            if (result == null)
                return NotFound(new { message = "Workout plan not found" });

            return Ok(result);
        }

        [Authorize(Roles = "Coach")]
        [HttpGet("ClientWithoutPlansAssigned")]
        public async Task<IActionResult> GetClientsWithoutAssignedPlans([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = "all")
        {
            var result = await _coachService.GetClientsWithoutAssignedPlans(pageNumber, pageSize, searchTerm, User);
            if (result == null)
                return NotFound(new { message = "Plans Assigned to all Clients" });

            return Ok(result);
        }
        [Authorize]
        [HttpGet("getAllCoaches")]
        public async Task<IActionResult> GetAllCoaches([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var coaches = await _coachService.GetAllCoachesAsync(pageNumber, pageSize);
                return Ok(coaches);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{id}/completed")]
        [Authorize(Roles = "Coach")]
        public async Task<IActionResult> MarkAsCompleted(Guid id)
        {
            try
            {
                // ; // extract from JWT token
                await _coachService.MarkPlanAsCompletedAsync(id, User);
                return Ok(new { message = "Plan marked as completed." });
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

        [HttpGet("assignedPlansByWeek")]
        [Authorize(Roles = "Coach")]
        public async Task<IActionResult> AssignedPlansByWeek()
        {
            try
            {
                var chartData = await _coachService.GetAssignedPlansChartAsync(User);
                return Ok(chartData);
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
        [HttpPost("assignSubCoach")]
        [Authorize(Roles = "Coach")]
        public async Task<IActionResult> AssignSubCoach(AssignSubCoachDTO dto)
        {
            try
            {
                var result = await _coachService.AssignSubCoach(User, dto);
                if (result.Any(r => r))
                    return Ok(new { message = "Sub-coach assigned successfully" });
                return BadRequest("Failed to assign sub-coach");
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