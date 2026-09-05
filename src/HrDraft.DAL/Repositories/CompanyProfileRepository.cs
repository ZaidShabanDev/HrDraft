using HrDraft.Core.Abstractions;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL.Repositories;

public sealed class CompanyProfileRepository(HrDraftDbContext context) : ICompanyProfileRepository
{
    public Task<CompanyProfile?> GetCurrentAsync(CancellationToken cancellationToken = default) =>
        context.CompanyProfiles
            .Include(p => p.CompBands.OrderBy(b => b.SortOrder))
            .Include(p => p.UpdatedByUser)
            .FirstOrDefaultAsync(p => p.IsCurrent, cancellationToken);

    public Task<CompanyProfile?> GetByIdAsync(int companyProfileId, CancellationToken cancellationToken = default) =>
        context.CompanyProfiles
            .Include(p => p.CompBands.OrderBy(b => b.SortOrder))
            .Include(p => p.UpdatedByUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.CompanyProfileId == companyProfileId, cancellationToken);

    public async Task AddAsNewCurrentAsync(CompanyProfile profile, CancellationToken cancellationToken = default)
    {
        // Runs now, not at SaveChanges: the filtered unique index would reject the insert if
        // the previous row still claimed IsCurrent. See ICompanyProfileRepository — the caller
        // is responsible for the surrounding transaction.
        await context.CompanyProfiles
            .Where(p => p.IsCurrent)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsCurrent, false), cancellationToken);

        profile.IsCurrent = true;
        context.CompanyProfiles.Add(profile);
    }
}
