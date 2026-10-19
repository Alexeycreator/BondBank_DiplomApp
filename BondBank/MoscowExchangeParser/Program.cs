using DotNetEnv;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MoscowExchangeParser;
using MoscowExchangeParser.HelperMethods;
using MoscowExchangeParser.Models;
using NLog.Extensions.Logging;
using Shared.BotHelpers;
using Shared.Config.MinIO;
using Shared.Connection;
using Shared.Services;
using Shared.Services.Interfaces;
using Shared.Services.MinIO;
using Shared.WorkingWithFiles;

Env.Load();
var configuration = new ConfigurationBuilder()
    .AddEnvironmentVariables()
    .Build();

var services = new ServiceCollection();

services.AddSingleton<IConfiguration>(configuration);

services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddNLog();
});

services.AddHttpClient();
services.AddHttpClient<ConnectionMonitor>();
services.AddHttpClient<CsvService>();

services.AddSingleton<InternetChecker>();
services.AddSingleton<BotService>();
services.AddSingleton<ConnectionMonitor>();
services.AddSingleton<CsvHelper>();

services.AddSingleton<BondParser>();
services.AddSingleton<IBondProvider<Bond>, BondParser>();

var minioConfig = new MinioConfig
{
    Endpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT") ?? "http://localhost:9000",
    AccessKey = Environment.GetEnvironmentVariable("MINIO_ACCESS_KEY") ?? "admin_mio",
    SecretKey = Environment.GetEnvironmentVariable("MINIO_SECRET_KEY") ?? "admin_mio",
    BucketName = Environment.GetEnvironmentVariable("MINIO_BUCKET_NAME") ?? "bondbank-files"
};

services.AddSingleton(minioConfig);
services.AddSingleton<MinioStorageService>();

var sp = services.BuildServiceProvider();

var parser = sp.GetRequiredService<BondParser>();
await parser.GetBondsAsync();