using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models.WorkoutModel;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class WorkoutRepo: Repository<Guid, Workout>
    {
        public WorkoutRepo(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public  async override Task<Workout> Get(Guid key)
        {
            return await _fitnessContext.Workout.SingleOrDefaultAsync(u => u.Id == key);
        }

        public async  override Task<IEnumerable<Workout>> GetAll()
        {
            return await _fitnessContext.Workout.ToListAsync();
        }
    }
}