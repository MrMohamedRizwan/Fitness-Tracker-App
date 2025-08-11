using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTrackerAPI.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    public class GeneralController : ControllerBase
    {
        private readonly IGeneralService _generalService;
        public GeneralController(IGeneralService generalService)
        {
            _generalService = generalService;
        }

        [HttpGet("dietplan/{title}")]
        [Authorize]
        public async Task<IActionResult> GetDietPlanByTitle(string title)
        {
            var result = await _generalService.GetDietPlanByTitle(title);
            if (result == null)
                return NotFound(new { message = "Diet plan not found" });

            return Ok(result);
        }

        [HttpGet("Workoutplan/{title}")]
        [Authorize]
        public async Task<IActionResult> GetWorkoutPlanByTitle(string title)
        {
            // System.Console.WriteLine($"{title}💕");
            var result = await _generalService.GetWorkouttPlanByTitle(title);
            if (result == null)
                return NotFound(new { message = "Workout plan not found" });

            return Ok(result);
        }

    }
}