using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.Snils;

public sealed record SnilsDto(int Id, string Number, DateOnly? RegistrationDate)
{
    public static SnilsDto From(SnilsModel model) => new(model.Id, model.Number, model.RegistrationDate);
}
