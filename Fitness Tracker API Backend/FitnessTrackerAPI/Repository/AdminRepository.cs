using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class AdminRepository: Repository<Guid, Admin>
    {
        public AdminRepository(FitnessDBContext context):base(context)
        {
            
        }
        public override async Task<Admin> Get(Guid key)
        {
            return await _fitnessContext.Admin.SingleOrDefaultAsync(u => u.Id == key);

        }

        public override async Task<IEnumerable<Admin>> GetAll()
        {
            return await _fitnessContext.Admin.ToListAsync();
        }
    }
}