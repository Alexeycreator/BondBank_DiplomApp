using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.Bonds;

public static class BondDtoMapper
{
    public static BondResponseDto ToResponseDto(BondsBaseModel bond) =>
        ToResponseDto(bond, GetBondType(bond));

    public static BondResponseDto ToResponseDto(BondDto bondDto)
    {
        if (bondDto.Bond is null || bondDto.Type is null)
        {
            throw new InvalidOperationException("Bond response is missing its type or bond data.");
        }

        return ToResponseDto(bondDto.Bond, bondDto.Type);
    }
    
    private static BondResponseDto ToResponseDto(BondsBaseModel bond, string type)
    {
        object specificData = bond switch
        {
            LjubljanaStockExchangeBondsModel lse => new LjubljanaBondSpecificDataDto(
                lse.Sector,
                lse.Symbol,
                lse.ListedQuantity,
                lse.NominalValue,
                lse.Currency,
                lse.ListingDate,
                lse.DelistingDate),
            WienerBoerseBondsModel wb => new WienerBondSpecificDataDto(
                wb.Last,
                wb.Chg,
                wb.Date,
                wb.Bid,
                wb.Ask,
                wb.Maturity,
                wb.Status,
                wb.Currency),
            SixGroupBondsModel sg => new SixGroupBondSpecificDataDto(
                sg.ValorId,
                sg.TradingBaseCurrency,
                sg.CouponRate,
                sg.MaturityDate,
                sg.ClosingPrice,
                sg.ClosingPerfomance,
                sg.BidPrice,
                sg.AskPrice,
                sg.MarketTime,
                sg.MarketDate,
                sg.IssuerNameFull,
                sg.ProductLine,
                sg.IndustrySectorCode,
                sg.SecTypeCode,
                sg.AmountInIssue,
                sg.YieldToWorst),
            MoscowExchangeBondsModel me => new MoscowBondSpecificDataDto(
                me.SecurityType,
                me.SecurityTypeId,
                me.Type,
                me.SecId,
                me.ShortName,
                me.RegNumber,
                me.IsTraded,
                me.PrimaryBoardId,
                me.Market,
                me.Engine,
                me.FaceValue,
                me.FaceUnit),
            _ => throw new InvalidOperationException(
                $"Unsupported bond model type: {bond.GetType().Name}")
        };

        var normalizedType = type.ToLowerInvariant();
        var expectedType = GetBondType(bond);

        if (!string.Equals(normalizedType, expectedType, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Bond type '{type}' does not match model type '{bond.GetType().Name}'.");
        }

        return new BondResponseDto(
            normalizedType,
            new BondBaseDto(
                bond.Id,
                bond.Name,
                bond.Isin,
                bond.UpdatedAt,
                bond.PortfoliosId,
                bond.CurrencyRatesId),
            specificData);
    }

    private static string GetBondType(BondsBaseModel bond) => bond switch
    {
        LjubljanaStockExchangeBondsModel => "lse",
        WienerBoerseBondsModel => "wb",
        SixGroupBondsModel => "sg",
        MoscowExchangeBondsModel => "me",
        _ => throw new InvalidOperationException(
            $"Unsupported bond model type: {bond.GetType().Name}")
    };
}
