using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Repository
{
    public class ClientRepository : Repository<Guid, Client>
    {
        public ClientRepository(FitnessDBContext context):base(context)
        {
            
        }
        public override async Task<Client> Get(Guid key)
        {
            return await _fitnessContext.Client.SingleOrDefaultAsync(u => u.Id == key);

        }
        public override async Task<IEnumerable<Client>> GetAll()
        {
            return await _fitnessContext.Client.ToListAsync();
        }
    }
}