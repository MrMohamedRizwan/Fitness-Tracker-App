using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models.WorkoutModel;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class WorkoutPlanRepo: Repository<Guid, WorkoutPlan>
    {
        public WorkoutPlanRepo(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public async override Task<WorkoutPlan> Get(Guid key)
        {
            return await _fitnessContext.WorkoutPlan.SingleOrDefaultAsync(u => u.Id == key);
        }

        public async override Task<IEnumerable<WorkoutPlan>> GetAll()
        {
            return await _fitnessContext.WorkoutPlan.ToListAsync();
        }
    }
}