using HrDraft.Model.Entities;

namespace HrDraft.Core.Abstractions;

public interface ICompanyProfileRepository
{
    /// <summary>The version generations read from, with its comp bands. Null before first save.</summary>
    Task<CompanyProfile?> GetCurrentAsync(CancellationToken cancellationToken = default);

    /// <summary>A specific version, for showing what fed an old draft.</summary>
    Task<CompanyProfile?> GetByIdAsync(int companyProfileId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clears <c>IsCurrent</c> on the existing version immediately, then stages the new one.
    /// <strong>Call this inside <see cref="IUnitOfWork.InTransactionAsync"/>.</strong> The
    /// clear has to run before the insert or the filtered unique index rejects it, which
    /// means it cannot wait for SaveChanges — so without the transaction a failure between
    /// the two leaves no current profile at all.
    /// </summary>
    Task AddAsNewCurrentAsync(CompanyProfile profile, CancellationToken cancellationToken = default);
}
