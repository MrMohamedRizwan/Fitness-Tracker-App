# FROM mcr.microsoft.com/dotnet/sdk:9.0-preview AS build
# WORKDIR /App
# COPY . ./
# RUN dotnet restore
# RUN dotnet publish -o out

# FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview
# WORKDIR /App
# COPY --from=build /App/out .
# EXPOSE 80
# ENTRYPOINT ["dotnet", "FitnessTrackerAPI.dll"]



# Stage 1: Runtime base with OpenSSL and cert generation
# Stage 1: Runtime base with OpenSSL and cert generation
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

# Install openssl
RUN apt-get update && apt-get install -y openssl

# Create self-signed cert and store it in /https
RUN mkdir /https && \
    openssl req -x509 -nodes -days 365 \
      -newkey rsa:2048 \
      -keyout /https/aspnetcore.key \
      -out /https/aspnetcore.crt \
      -subj "/CN=localhost" && \
    openssl pkcs12 -export \
      -out /https/aspnetcore.pfx \
      -inkey /https/aspnetcore.key \
      -in /https/aspnetcore.crt \
      -passout pass:password

EXPOSE 8080
EXPOSE 8081

# Stage 2: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj and restore
COPY ["FitnessTrackerAPI.csproj", "./"]
RUN dotnet restore "FitnessTrackerAPI.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "FitnessTrackerAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "FitnessTrackerAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime
FROM base AS final
WORKDIR /app

COPY --from=publish /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS="http://+:8080;https://+:8081"

ENTRYPOINT ["dotnet", "FitnessTrackerAPI.dll"]
