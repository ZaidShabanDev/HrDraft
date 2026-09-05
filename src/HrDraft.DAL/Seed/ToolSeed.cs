using HrDraft.Model;
using HrDraft.Model.Entities;

namespace HrDraft.DAL.Seed;

/// <summary>
/// The seven tools, seeded through the migration so a fresh database is usable immediately.
/// <c>ToolKey</c> values match the front end's tool registry; changing one here without
/// changing it there breaks the home grid.
///
/// <c>SkillFileNames</c> are relative to the vendored skill library root and map to
/// tuanductran/hr-skills — see the spec's § Source: hr-skills repo.
/// </summary>
internal static class ToolSeed
{
    internal static Tool[] Rows =>
    [
        new()
        {
            ToolId = 1,
            ToolKey = "job-description",
            Category = ToolCategory.Recruiting,
            DisplayName = "Job description",
            DisplayNumber = "01",
            Description = "Title, seniority, must-haves → full JD with comp and inclusive closing.",
            ShortDescription = "Title, seniority, must-haves → full JD.",
            SkillFileNames = "hr-job-description/SKILL.md",
            MaxOutputTokens = 4000,
            RequiresHumanReview = true,
            EstimatedSeconds = 20,
            IsActive = true,
            SortOrder = 1,
        },
        new()
        {
            ToolId = 2,
            ToolKey = "jd-rewriter",
            Category = ToolCategory.Recruiting,
            DisplayName = "JD rewriter",
            DisplayNumber = "02",
            Description = "Paste an old posting → debiased, restructured, inclusive.",
            ShortDescription = "Paste an old posting → debiased.",
            SkillFileNames = "hr-job-description/SKILL.md",
            MaxOutputTokens = 4000,
            RequiresHumanReview = true,
            EstimatedSeconds = 25,
            IsActive = true,
            SortOrder = 2,
        },
        new()
        {
            ToolId = 3,
            ToolKey = "interview-questions",
            Category = ToolCategory.Recruiting,
            DisplayName = "Interview questions",
            DisplayNumber = "03",
            Description = "Competency set by interview type, with follow-ups.",
            ShortDescription = "Competency set with follow-ups.",
            SkillFileNames =
                "hr-interviewing/SKILL.md;hr-recruiting/prompts/writing-competency-based-interview-questions.md",
            MaxOutputTokens = 3000,
            RequiresHumanReview = false,
            EstimatedSeconds = 20,
            IsActive = true,
            SortOrder = 3,
        },
        new()
        {
            ToolId = 4,
            ToolKey = "scorecard",
            Category = ToolCategory.Recruiting,
            DisplayName = "Scorecard",
            DisplayNumber = "04",
            Description = "Rating grid with strong / weak answer guidance.",
            ShortDescription = "Rating grid with answer guidance.",
            SkillFileNames = "hr-interviewing/SKILL.md",
            MaxOutputTokens = 3000,
            RequiresHumanReview = false,
            EstimatedSeconds = 18,
            IsActive = true,
            SortOrder = 4,
        },
        new()
        {
            ToolId = 5,
            ToolKey = "plan-30-60-90",
            Category = ToolCategory.Onboarding,
            DisplayName = "30/60/90 plan",
            DisplayNumber = "05",
            Description = "Phased milestones by role, manager and goals.",
            ShortDescription = "Phased milestones by role and goals.",
            SkillFileNames =
                "hr-onboarding/SKILL.md;hr-onboarding/examples/create-30-60-90-day-onboarding-plan.md",
            MaxOutputTokens = 4000,
            RequiresHumanReview = false,
            EstimatedSeconds = 25,
            IsActive = true,
            SortOrder = 5,
        },
        new()
        {
            ToolId = 6,
            ToolKey = "onboarding-checklist",
            Category = ToolCategory.Onboarding,
            DisplayName = "Onboarding checklist",
            DisplayNumber = "06",
            Description = "Week-by-week, systems and equipment included.",
            ShortDescription = "Week-by-week, systems included.",
            SkillFileNames = "hr-onboarding/SKILL.md;hr-onboarding/prompts/employee-onboarding.md",
            MaxOutputTokens = 3000,
            RequiresHumanReview = false,
            EstimatedSeconds = 20,
            IsActive = true,
            SortOrder = 6,
        },
        new()
        {
            ToolId = 7,
            ToolKey = "welcome-email",
            Category = ToolCategory.Onboarding,
            DisplayName = "Welcome email",
            DisplayNumber = "07",
            Description = "First-day message for the team and the new hire.",
            ShortDescription = "First-day message for the new hire.",
            SkillFileNames = "hr-onboarding/SKILL.md",
            MaxOutputTokens = 1500,
            RequiresHumanReview = false,
            EstimatedSeconds = 12,
            IsActive = true,
            SortOrder = 7,
        },
    ];
}
