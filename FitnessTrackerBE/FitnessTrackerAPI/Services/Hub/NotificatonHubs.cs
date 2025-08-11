using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace FitnessTrackerAPI.Services.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task Subscribe(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
        // public async Task LeaveGroup(string clientId)
        // {
        //     await Groups.RemoveFromGroupAsync(Context.ConnectionId, clientId);
        // }

        public Task JoinCoachGroup(string coachId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, coachId);
        }

        public Task LeaveCoachGroup(string coachId)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, coachId);
        }
    }
}