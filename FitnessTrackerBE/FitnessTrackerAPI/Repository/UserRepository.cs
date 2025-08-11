using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class UserRepository : Repository<string, User>
    {
         public UserRepository(FitnessDBContext context):base(context)
        {
            
        }
        public override async Task<User> Get(string key)
        {
            return await _fitnessContext.Users.SingleOrDefaultAsync(u => u.Email == key);
        }

        public override async Task<IEnumerable<User>> GetAll()
        {
            return await _fitnessContext.Users.ToListAsync();
        }
        
    }
}