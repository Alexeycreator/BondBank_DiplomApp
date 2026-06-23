using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace BondBank_WebApi.Controllers.WorkingWithFiles;

[Route("api/[controller]")]
[ApiController]
public sealed class ExportImportFilesController(ILogger<ExportImportFilesController> logger) : ControllerBase
{
    [HttpGet("export-bonds")]
    public async Task<IActionResult> ExportBonds(string fileName)
    {
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "ImportBondsFiles", fileName);
        if (string.IsNullOrEmpty(filePath))
        {
            return BadRequest(new { message = $"Не удалось найти путь, откуда экспортировать файл" });
        }

        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filePath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(bytes, contentType, Path.GetFileName(filePath));
    }

    [HttpPost("import-bonds")]
    public async Task<IActionResult> ImportBonds(IFormFile file, [FromQuery] string typeFile)
    {
        logger.LogInformation($"Получен запрос на импорт: {typeFile}. Файл: {file.FileName}");
        if (file.Length == 0)
        {
            return BadRequest(new { message = $"Файла не существует!" });
        }

        if (string.IsNullOrEmpty(typeFile))
        {
            return BadRequest(new { message = $"Тип файла не указан!" });
        }

        string uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "ImportBondsFiles", typeFile);
        if (!Directory.Exists(uploadDirectory))
        {
            Directory.CreateDirectory(uploadDirectory);
        }

        string filePath = Path.Combine(uploadDirectory, file.FileName);
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok($"Файл импортирован!");
    }
}