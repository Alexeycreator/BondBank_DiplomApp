using Shared.Models;

namespace Shared.Services.Interfaces;

public interface IBondProvider<TBond> where TBond : BondBase
{
    Task<List<TBond>> GetBonds();
    Task<List<TBond>> FillingBonds();
}