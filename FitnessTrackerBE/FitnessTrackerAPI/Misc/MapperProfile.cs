using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.Models.Diet;
using FitnessTrackerAPI.Models.DTOs;
using FitnessTrackerAPI.Models.WorkoutModel;

namespace FitnessTrackerAPI.Misc
{
    public class MapperProfile: Profile
    {
        public MapperProfile()
        {
            CreateMap<CoachAddRequestDTO, User>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email))
            .ForMember(dest => dest.Password, opt => opt.Ignore());




            
            CreateMap<UserDTO, User>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email))
            .ForMember(dest => dest.Password, opt => opt.Ignore());

            CreateMap<UserDTO, Admin>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email));





            CreateMap<User, CoachAddRequestDTO>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email));
            CreateMap<CoachAddRequestDTO, Coach>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email));

            CreateMap<ClientAddRequestDTO, User>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email))
            .ForMember(dest => dest.Password, opt => opt.Ignore());

            CreateMap<User, ClientAddRequestDTO>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email));
            CreateMap<ClientAddRequestDTO, Client>()
            .ForMember(dest => dest.Email, act => act.MapFrom(src => src.Email));

            CreateMap<DietPlanCreateRequestDTO, DietPlan>()
            .ForMember(dest => dest.Meals, opt => opt.Ignore());
            CreateMap<DietMealCreateDTO, DietMeal>();

            CreateMap<WorkoutPlanCreateRequestDTO, WorkoutPlan>()
            .ForMember(dest => dest.Exercises, opt => opt.Ignore());
            CreateMap<WorkoutExerciseCreateDTO, WorkoutExercise>();
        }
    }
}