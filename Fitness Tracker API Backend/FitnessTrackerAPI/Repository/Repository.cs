using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;

namespace FitnessTrackerAPI.Repository
{
     public  abstract class Repository<K, T> : IRepository<K,T> where T:class
    {
        protected readonly FitnessDBContext _fitnessContext;
        public Repository(FitnessDBContext fitnessContext)
        {
            _fitnessContext = fitnessContext;
        }

        public async Task<T> Add(T item)
        {
            _fitnessContext.Add(item);
            await _fitnessContext.SaveChangesAsync();//generate and execute the DML quries for the objects whse state is in ['added','modified','deleted'],
            return item;
        }

        public async Task<T> Delete(K key)
        {
            var item = await Get(key);
            if (item != null)
            {
                _fitnessContext.Remove(item);
                await _fitnessContext.SaveChangesAsync();
                return item;
            }
            throw new Exception("No such item found for deleting");
        }

        public abstract Task<T> Get(K key);


        public abstract Task<IEnumerable<T>> GetAll();


        public async Task<T> Update(K key, T item)
        {
            var myItem = await Get(key);
            if (myItem != null)
            {
                _fitnessContext.Entry(myItem).CurrentValues.SetValues(item);
                await _fitnessContext.SaveChangesAsync();
                return item;
            }
            throw new Exception("No such item found for updation");
        }
    }

}