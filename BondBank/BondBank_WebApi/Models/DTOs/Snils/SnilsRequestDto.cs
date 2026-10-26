namespace BondBank_WebApi.Models.DTOs.Snils;

public sealed record SnilsRequestDto(
    string Number,
    DateOnly? RegistrationDate);