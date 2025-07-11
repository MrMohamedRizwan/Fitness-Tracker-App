using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Amazon.S3;
using FitnessTrackerAPI.Context;
using FitnessTrackerAPI.Interfaces;
using FitnessTrackerAPI.Misc;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.WorkoutModel;
using FitnessTrackerAPI.Repository;
using FitnessTrackerAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql.Replication.PgOutput.Messages;
using Amazon.Extensions.NETCore.Setup;

using Serilog;

using Amazon.Runtime;
using FitnessTrackerAPI.Services.Hubs;
using Amazon.SimpleEmail;
using Amazon;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo { Title = "Fitness Tracker API", Version = "v1" });
    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});
builder.Services.AddControllers()
                .AddJsonOptions(opts =>
                {
                    opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
                    opts.JsonSerializerOptions.WriteIndented = true;
                });


#region Logging

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();


builder.Host.UseSerilog(); 


#endregion

builder.Services.AddDbContext<FitnessDBContext>(opts =>
{
    opts.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
#region  Repositories
builder.Services.AddTransient<IRepository<Guid, Coach>, CoachRepository>();
builder.Services.AddTransient<IRepository<Guid, Client>, ClientRepository>();
builder.Services.AddTransient<IRepository<Guid, DietMeal>, DietMealRepo>();
builder.Services.AddTransient<IRepository<Guid, DietPlan>, DietPlanRepo>();
builder.Services.AddTransient<IRepository<Guid, WorkoutPlan>, WorkoutPlanRepo>();
builder.Services.AddTransient<IRepository<Guid, WorkoutExercise>, WorkoutExerciceRepo>();
builder.Services.AddTransient<IRepository<Guid, PlanAssignment>, PlanAssignmentRepository>();
builder.Services.AddTransient<IRepository<Guid, Workout>, WorkoutRepo>();
builder.Services.AddTransient<IRepository<Guid, Progress>, ProgressRepo>();
builder.Services.AddTransient<IRepository<Guid, WorkoutPlan>, WorkoutPlanRepo>();
builder.Services.AddTransient<IRepository<Guid, Admin>, AdminRepository>();







builder.Services.AddTransient<IRepository<string, User>, UserRepository>();

#endregion

#region Services
builder.Services.AddTransient<IEncryptionService, EncryptionService>();
builder.Services.AddTransient<ITokenService, TokenService>();
builder.Services.AddTransient<IAuthenticationService, AuthenticationService>();
builder.Services.AddTransient<IClientService, ClientService>();
builder.Services.AddTransient<ICoachService, CoachService>();
builder.Services.AddTransient<IWorkoutService, WorkoutService>();
builder.Services.AddTransient<IProgressService, ProgressService>();
builder.Services.AddTransient<IAWSService, AWSS3Service>();
builder.Services.AddTransient<IGeneralService, GeneralService>();
builder.Services.AddTransient<IWorkoutPlan, WorkoutPlanService>();
builder.Services.AddTransient<IDietServices, DietPlanService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddTransient<IOtpService, OtpService>();

builder.Services.AddHostedService<UserActivityChecker>();




var awsSection = builder.Configuration.GetSection("AWS");
var awsRegion = awsSection["Region"];
var accessKey = awsSection["AccessKey"];
var secretKey = awsSection["SecretKey"];

var credentials = new BasicAWSCredentials(accessKey, secretKey);

builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    return new AmazonS3Client(credentials, Amazon.RegionEndpoint.GetBySystemName(awsRegion));
});
var awsOptions = new AWSOptions
{
    Region = RegionEndpoint.GetBySystemName(awsRegion),
    Credentials = new BasicAWSCredentials(accessKey, secretKey)
};

builder.Services.AddDefaultAWSOptions(awsOptions);
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonSimpleEmailService>(); 


builder.Services.AddScoped<IAWSService, AWSS3Service>();


#endregion

#region AuthenticationFilter
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Keys:JwtTokenKey"])),
                RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    error = "Authentication failed. Missing or invalid JWT token."
                });


                return context.Response.WriteAsync(result);
            },
            OnForbidden = context =>
            {
                 Console.WriteLine("\n\n ⚠️ OnForbidden triggered\n\n"); 
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";

                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    error = "You do not have permission to access this resource."
                });

                return context.Response.WriteAsync(result);
            }
        };
    });

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var userId = httpContext.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? httpContext.Connection.RemoteIpAddress?.ToString()
                     ?? "anonymous";

        return RateLimitPartition.GetTokenBucketLimiter(userId, _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 1000,
            TokensPerPeriod = 1000,
            ReplenishmentPeriod = TimeSpan.FromHours(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsync("Rate limit exceeded. Try again later.", token);
    };
});

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultScheme = "Cookies";
//     options.DefaultChallengeScheme = "Google";
// })
// .AddCookie("Cookies")
// .AddGoogle("Google", options =>
// {
//     options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
//     options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
//     options.SaveTokens = true; 
//     options.Scope.Add("openid"); 
//     options.Scope.Add("profile");
//     options.Scope.Add("email");
// });  

// builder.Services.AddScoped<IAuthorizationHandler,DoctorHandler>();

// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("ExperiencedDoctorOnly", policy =>
//         policy.Requirements.Add(new DoctorRequirement(3)));
// });


#endregion

#region  Misc
builder.Services.AddAutoMapper(typeof(User));
builder.Services.AddScoped<CustomExceptionFilter>();
builder.Services.AddTransient<UniqueIdByEmail>();


#endregion

#region CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500","http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

#endregion
builder.Services.AddSignalR();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseMiddleware<LoggingMiddleWare>();
app.UseRateLimiter(); 
app.UseAuthentication();
app.UseAuthorization();
app.MapHub<NotificationHub>("/notificationHub");


app.MapControllers();

app.Run();


