using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FitnessTrackerAPI.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FitnessTrackerAPI.Misc
{
    public class CustomExceptionFilter : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            int statusCode = (int)HttpStatusCode.InternalServerError; // Default 500
            string message = context.Exception.Message;

            switch (context.Exception)
            {
                case UnauthorizedAccessException:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    break;

                case ArgumentException:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case KeyNotFoundException:
                    statusCode = (int)HttpStatusCode.NotFound;
                    break;

                case NotImplementedException:
                    statusCode = (int)HttpStatusCode.NotImplemented;
                    break;

                case OperationCanceledException:
                    statusCode = (int)HttpStatusCode.RequestTimeout;
                    break;

                case InvalidOperationException:
                    statusCode = (int)HttpStatusCode.Conflict;
                    break;
            }

            context.Result = new ObjectResult(new ErrorObjectDTO
            {
                ErrorNumber = statusCode,
                ErrorMessage = message
            })
            {
                StatusCode = statusCode
            };

            context.ExceptionHandled = true;
        }
    }
}