namespace Shared.WorkingWithFiles;

public class CsvWorker
{
    private readonly HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
    private readonly HttpClient httpClient = new HttpClient();
    private static string dateGet = DateTime.Now.ToShortDateString();

    public void EnsureDirectoryExists(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }
    }

    public async Task FileSend(string csvPath, string urlWebService, string type)
    {
        try
        {
            if (httpResponseMessage.IsSuccessStatusCode)
            {
                switch (type)
                {
                    case "wb":
                        await Send(csvPath, urlWebService, type);
                        break;
                    case "lse":
                        await Send(csvPath, urlWebService, type);
                        break;
                    case "sg":
                        await Send(csvPath, urlWebService, type);
                        break;
                    case "me":
                        await Send(csvPath, urlWebService, type);
                        break;
                    default: break;
                }
            }
        }
        catch (Exception ex)
        {
        }
    }

    private async Task Send(string csvPath, string urlWebService, string type)
    {
        using var formDataFile = new MultipartFormDataContent();
        await using (var fileStream = File.OpenRead(csvPath))
        {
            formDataFile.Add(new StreamContent(fileStream), "file", $"bonds_{dateGet}.csv");
            formDataFile.Add(new StringContent(type), "typeFile");
            var responseFile = await httpClient.PostAsync(urlWebService, formDataFile);
            if (responseFile.IsSuccessStatusCode)
            {
            }
            else
            {
            }
        }
    }
}