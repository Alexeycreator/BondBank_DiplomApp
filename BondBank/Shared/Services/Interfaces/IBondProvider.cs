using Shared.Models;

namespace Shared.Services;

public interface IBondProvider<TBond> where TBond : BondBase
{
    public Task<List<TBond>> GetBonds();
    public Task<List<TBond>> FillingBonds();
}