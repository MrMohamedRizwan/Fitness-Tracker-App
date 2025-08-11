using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class CoachRepository: Repository<Guid, Coach>
    {
        public CoachRepository(FitnessDBContext context):base(context)
        {
            
        }
        public override async Task<Coach> Get(Guid key)
        {
            return await _fitnessContext.Coach.SingleOrDefaultAsync(u => u.Id == key);

        }

        public override async Task<IEnumerable<Coach>> GetAll()
        {
            return await _fitnessContext.Coach.ToListAsync();
        }
    }
}