using System.ComponentModel.DataAnnotations;

namespace BondBank_WebApi.Models.DTOs.News;

public sealed record NewsRequestDto(
    [Required] [MaxLength(50)] string Category,
    [Required] string Title,
    [MaxLength(500)] string? Image,
    [Required] string Body,
    DateOnly? Date
);