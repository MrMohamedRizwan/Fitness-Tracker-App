using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models.Diet;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class DietMealRepo : Repository<Guid, DietMeal>
    {
        public DietMealRepo(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public async override Task<DietMeal> Get(Guid key)
        {
            return await _fitnessContext.DietMeal.SingleOrDefaultAsync(u => u.Id == key);
        }

        public async override Task<IEnumerable<DietMeal>> GetAll()
        {
            return await _fitnessContext.DietMeal.ToListAsync();
        }
    }
}