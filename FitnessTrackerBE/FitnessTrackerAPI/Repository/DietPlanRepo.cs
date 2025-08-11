using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models.Diet;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class DietPlanRepo : Repository<Guid, DietPlan>
    {
        public DietPlanRepo(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public async override Task<DietPlan> Get(Guid key)
        {
            return await _fitnessContext.DietPlans.SingleOrDefaultAsync(u => u.Id == key);
        }
        public async override Task<IEnumerable<DietPlan>> GetAll()
        {
            return await _fitnessContext.DietPlans.ToListAsync();
        }
    }
}