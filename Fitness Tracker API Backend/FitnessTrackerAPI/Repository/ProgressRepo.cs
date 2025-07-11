using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class ProgressRepo : Repository<Guid, Progress>
    {
        public ProgressRepo(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public async override Task<Progress> Get(Guid key)
        {
            return await _fitnessContext.Progress.SingleOrDefaultAsync(u => u.Id == key);
        }

        public async override Task<IEnumerable<Progress>> GetAll()
        {
            return await _fitnessContext.Progress.ToListAsync();
        }
    }
}