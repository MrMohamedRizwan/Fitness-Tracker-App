using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FitnessTrackerAPI.Misc
{
    public class LoggingMiddleWare
    {
        private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleWare> _logger;

    public LoggingMiddleWare(RequestDelegate next, ILogger<LoggingMiddleWare> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        var userId = context.User.FindFirst("UserId")?.Value ?? "anonymous";
        var endpoint = context.Request.Path;
        var method = context.Request.Method;

        _logger.LogInformation("API Call: {Method} {Endpoint} by {UserId} at {Time}",
            method, endpoint, userId, DateTime.UtcNow);

        await _next(context);
    }
    }
}