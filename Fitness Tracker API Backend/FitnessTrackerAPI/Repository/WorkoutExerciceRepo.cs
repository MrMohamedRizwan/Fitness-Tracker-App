using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models.WorkoutModel;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class WorkoutExerciceRepo : Repository<Guid, WorkoutExercise>
    {
        public WorkoutExerciceRepo(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public async override Task<WorkoutExercise> Get(Guid key)
        {
            return await _fitnessContext.WorkoutExercise.SingleOrDefaultAsync(u => u.Id == key);
        }

        public async override Task<IEnumerable<WorkoutExercise>> GetAll()
        {
            return await _fitnessContext.WorkoutExercise.ToListAsync();
        }
    }
}