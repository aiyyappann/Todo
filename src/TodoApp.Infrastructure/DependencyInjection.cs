using Microsoft.Extensions.DependencyInjection;
using TodoApp.Domain.Repositories;
using TodoApp.Infrastructure.Context;
using TodoApp.Infrastructure.Repositories;

namespace TodoApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Global Bson Configuration
        try { MongoDB.Bson.Serialization.BsonSerializer.RegisterSerializer(new MongoDB.Bson.Serialization.Serializers.GuidSerializer(MongoDB.Bson.GuidRepresentation.Standard)); }
        catch (MongoDB.Bson.BsonSerializationException) { /* catch if already registered to be safe in re-runs */ }

        services.AddSingleton<MongoDbContext>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        return services;
    }
}
