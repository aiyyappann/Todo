using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using TodoApp.Domain.Entities;

namespace TodoApp.Infrastructure.Context;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDb");
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase("TodoApp"); // DB name can also be in config
    }

    public IMongoCollection<Domain.Entities.Task> Tasks => _database.GetCollection<Domain.Entities.Task>("tasks");
}
