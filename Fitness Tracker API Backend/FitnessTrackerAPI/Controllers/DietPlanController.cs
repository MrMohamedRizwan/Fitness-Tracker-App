using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTrackerAPI.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    public class DietPlanController : ControllerBase
    {
        private readonly IDietServices _dietServices;

        public DietPlanController(IDietServices dietServices)
        {
            _dietServices = dietServices;
        }
        [Authorize(Roles = "Coach")]
        [HttpPost("AddDiet")]
        public async Task<ActionResult<DietPlan>> CreateDiet([FromBody] DietPlanCreateRequestDTO diet)
        {
            try
            {
                var newMeal = await _dietServices.AddMeal(diet, User);
                if (newMeal != null)
                    return Created("", newMeal);
                return BadRequest("Unable to process request at this moment");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        [Authorize(Roles = "Coach")]
        [HttpPut("Edit-Diet/{id}")]
        public async Task<IActionResult> UpdateDietByTitle(Guid id, [FromBody] DietPlanCreateRequestDTO dto)
        {
            try
            {
                var updatedPlan = await _dietServices.UpdateDietPlanByTitle(id, dto, User);
                return Ok(new
                {
                    Message = "Diet plan updated successfully",
                    PlanId = updatedPlan.Id,
                    Title = updatedPlan.Title,
                    Meals = updatedPlan.Meals?.Select(m => new
                    {
                        m.MealType,
                        m.MealName,
                        m.Calories,
                        m.ProteinGrams,
                        m.CarbsGrams,
                        m.FatGrams
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
        [Authorize(Roles = "Coach")]
        [HttpDelete("Delete-Diet/{id}")]
        public async Task<IActionResult> DeleteDietByTitle(Guid id)
        {
            try
            {
                var success = await _dietServices.DeleteDietPlanByTitle(id, User);
                if (success)
                    return Ok(new { Message = $"Diet plan '{id}' deleted successfully" });
                return NotFound(new { Message = "Diet plan not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }

        }
        [Authorize(Roles = "Coach")]
        [HttpGet("diet/all")]
        public async Task<IActionResult> GetAllDietPlans([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var plans = await _dietServices.GetAllDietPlansDTO(User,pageNumber,pageSize);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("dietplan/{Id}")]
        [Authorize]
        public async Task<IActionResult> GetDietPlanByTitle(Guid Id)
        {
            var result = await _dietServices.GetDietPlanByTitle(Id, User);
            if (result == null)
                return NotFound(new { message = "Diet plan not found" });

            return Ok(result);
        }


    }
}