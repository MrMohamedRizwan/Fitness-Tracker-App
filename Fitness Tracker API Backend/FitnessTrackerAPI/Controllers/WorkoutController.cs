using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Misc;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace FitnessTrackerAPI.Controllers
{

    [ApiController]
    [ApiVersion("1.0")]
    [Route("/api/v{version:apiVersion}/[controller]")]
    [CustomExceptionFilter]
    public class WorkoutController : ControllerBase
    {
        private readonly IWorkoutService _workoutService;

        public WorkoutController(IWorkoutService workoutService)
        {
            _workoutService = workoutService;
        }
        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> AddWorkout([FromBody] WorkoutCreateDTO dto)
        {
            var result = await _workoutService.AddWorkout(dto, User);
            return CreatedAtAction(nameof(GetWorkoutById), new { id = result.Id }, result);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Client,Coach")]
        public async Task<IActionResult> GetWorkoutById(Guid id)
        {
            var result = await _workoutService.GetWorkoutById(id, User);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("client/{clientId}")]
        [Authorize(Roles = "Coach")]
        public async Task<IActionResult> GetWorkoutsForClient(Guid clientId)
        {
            var workouts = await _workoutService.GetWorkoutsByClientId(clientId);
            return Ok(workouts);
        }

        [HttpGet("client/my")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetMyWorkouts()
        {
            var workouts = await _workoutService.GetWorkoutsForCurrentClient(User);
            return Ok(workouts);
        }

    }

}