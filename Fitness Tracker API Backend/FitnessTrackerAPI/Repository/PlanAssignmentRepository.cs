using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class PlanAssignmentRepository : Repository<Guid, PlanAssignment>
    {
        public PlanAssignmentRepository(FitnessDBContext fitnessContext) : base(fitnessContext)
        {
        }

        public async override Task<PlanAssignment> Get(Guid key)
        {
            return await _fitnessContext.PlanAssignment.SingleOrDefaultAsync(u => u.Id == key);
        }

        public async override Task<IEnumerable<PlanAssignment>> GetAll()
        {
            return await _fitnessContext.PlanAssignment.ToListAsync();
        }
    }
}