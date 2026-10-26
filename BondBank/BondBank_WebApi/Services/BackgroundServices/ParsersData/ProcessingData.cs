using System.Globalization;
using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.BackgroundServices.ParsersData;

public sealed class ProcessingData(ILogger<ProcessingData> logger)
{
    public string ProcessingFile(string directoryPath)
    {
        logger.LogInformation($"Получение пути к файлу...");
        return Directory.GetFiles(directoryPath).Last();
    }

    public async Task<List<LjubljanaStockExchangeBondsModel>?> GetLjubljanaStockExchangeBondsAsync(string filePath)
    {
        var bonds = new List<LjubljanaStockExchangeBondsModel>();
        try
        {
            using var readerBonds = new StreamReader(filePath);
            string? line;
            await readerBonds.ReadLineAsync();
            while ((line = await readerBonds.ReadLineAsync()) != null)
            {
                var columns = line.Split(';');
                var bond = CreateLjubljanaStockExchangeBonds(columns);
                bonds?.Add(bond);
            }

            return bonds;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при преобразовании данных: {ExMessage}", ex.Message);
            return null;
        }
    }

    public async Task<List<MoscowExchangeBondsModel>?> GetMoscowExchangeBondsAsync(string filePath)
    {
        var bonds = new List<MoscowExchangeBondsModel>();
        try
        {
            using var readerBonds = new StreamReader(filePath);
            string? line;
            await readerBonds.ReadLineAsync();
            while ((line = await readerBonds.ReadLineAsync()) != null)
            {
                var columns = line.Split(';');
                var bond = CreateMoscowExchangeBonds(columns);
                bonds?.Add(bond);
            }

            return bonds;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при преобразовании данных: {ExMessage}", ex.Message);
            return null;
        }
    }

    public async Task<List<SixGroupBondsModel>?> GetSixGroupBondsAsync(string filePath)
    {
        var bonds = new List<SixGroupBondsModel>();
        try
        {
            using var readerBonds = new StreamReader(filePath);
            string? line;
            await readerBonds.ReadLineAsync();
            while ((line = await readerBonds.ReadLineAsync()) != null)
            {
                var columns = line.Split(';');
                var bond = CreateSixGroupBonds(columns);
                bonds?.Add(bond);
            }

            return bonds;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при преобразовании данных: {ExMessage}", ex.Message);
            return null;
        }
    }

    public async Task<List<WienerBoerseBondsModel>?> GetWienerBoerseBondsAsync(string filePath)
    {
        var bonds = new List<WienerBoerseBondsModel>();
        try
        {
            using var readerBonds = new StreamReader(filePath);
            string? line;
            await readerBonds.ReadLineAsync();
            while ((line = await readerBonds.ReadLineAsync()) != null)
            {
                var columns = line.Split(';');
                var bond = CreateWienerBoerseBonds(columns);
                bonds?.Add(bond);
            }

            return bonds;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при преобразовании данных: {ExMessage}", ex.Message);
            return null;
        }
    }

    private DateOnly? CheckingCorrectDelistingDate(string value)
    {
        if (string.IsNullOrEmpty(value) || value == "-")
        {
            return null;
        }

        return DateOnly.TryParse(value, out var date) ? date : null;
    }

    private LjubljanaStockExchangeBondsModel CreateLjubljanaStockExchangeBonds(string[] content)
    {
        return new LjubljanaStockExchangeBondsModel()
        {
            Symbol = content[0],
            Isin = content[1],
            Name = content[2],
            Sector = content[3][0],
            ListedQuantity = long.TryParse(content[4], out var quantity) ? quantity : 0,
            NominalValue = decimal.TryParse(content[5], out var nominal) ? nominal / 100 : 0,
            Currency = content[6],
            ListingDate = DateOnly.TryParse(content[7], out var listing) ? listing : DateOnly.MinValue,
            DelistingDate = CheckingCorrectDelistingDate(content[8]),
            UpdatedAt = DateTime.TryParse(content[10], out var updated)
                ? DateTime.SpecifyKind(updated, DateTimeKind.Utc)
                : DateTime.UtcNow
        };
    }

    private MoscowExchangeBondsModel CreateMoscowExchangeBonds(string[] content)
    {
        return new MoscowExchangeBondsModel()
        {
            SecurityType = content[0],
            SecurityTypeId = int.TryParse(content[1], out var typeId) ? typeId : 0,
            Type = content[2],
            SecId = content[3],
            ShortName = content[4],
            Name = content[5],
            RegNumber = content[6],
            IsTraded = bool.TryParse(content[7], out var isTraded) && isTraded,
            PrimaryBoardId = content[8],
            Market = content[9],
            Engine = content[10],
            FaceValue = decimal.TryParse(content[11], out var value) ? value / 100 : 0,
            FaceUnit = content[12],
            Isin = content[13],
            UpdatedAt = DateTime.TryParse(content[14], out var updated)
                ? DateTime.SpecifyKind(updated, DateTimeKind.Utc)
                : DateTime.UtcNow
        };
    }

    private SixGroupBondsModel CreateSixGroupBonds(string[] content)
    {
        return new SixGroupBondsModel()
        {
            Name = content[0],
            ValorId = content[1],
            TradingBaseCurrency = content[2],
            CouponRate = decimal.TryParse(content[3], out var rate) ? rate : 0,
            MaturityDate = DateOnly.TryParse(content[4], out var maturity) ? maturity : DateOnly.MaxValue,
            ClosingPrice = decimal.TryParse(content[5], out var closingPrice) ? closingPrice / 100 : 0,
            ClosingPerfomance = decimal.TryParse(content[6], out var closingPerfomance) ? closingPerfomance / 100 : 0,
            BidPrice = decimal.TryParse(content[7], out var bid) ? bid / 100 : 0,
            AskPrice = decimal.TryParse(content[8], out var ask) ? ask / 100 : 0,
            MarketTime = TimeOnly.TryParse(content[9], out var marketTime) ? marketTime : TimeOnly.MinValue,
            MarketDate = DateOnly.TryParse(content[10], out var marketDate) ? marketDate : DateOnly.MinValue,
            IssuerNameFull = content[11],
            ProductLine = content[12],
            IndustrySectorCode = int.TryParse(content[13], out var sectorCode) ? sectorCode : 0,
            SecTypeCode = content[14],
            Isin = content[15],
            AmountInIssue = long.TryParse(content[16], out var amount) ? amount : 0,
            YieldToWorst = decimal.TryParse(content[17], out var yieldToWorst) ? yieldToWorst / 100 : 0,
            UpdatedAt = DateTime.TryParse(content[18], out var updated)
                ? DateTime.SpecifyKind(updated, DateTimeKind.Utc)
                : DateTime.UtcNow
        };
    }

    private WienerBoerseBondsModel CreateWienerBoerseBonds(string[] content)
    {
        return new WienerBoerseBondsModel()
        {
            Name = content[0],
            Last = decimal.TryParse(content[1], NumberStyles.Any, CultureInfo.InvariantCulture, out var last)
                ? last
                : 0,
            Chg = content[2],
            Date = DateTime.TryParse(content[3], out var date) ? date : DateTime.UtcNow,
            Isin = content[4],
            Bid = decimal.TryParse(content[5], out var bid) ? bid / 100 : 0,
            Ask = decimal.TryParse(content[6], out var ask) ? ask / 100 : 0,
            Maturity = DateOnly.TryParse(content[7], out var maturity) ? maturity : DateOnly.MaxValue,
            Status = content[8][0],
            Currency = content[9],
            UpdatedAt = DateTime.TryParse(content[10], out var updated)
                ? DateTime.SpecifyKind(updated, DateTimeKind.Utc)
                : DateTime.UtcNow
        };
    }
}