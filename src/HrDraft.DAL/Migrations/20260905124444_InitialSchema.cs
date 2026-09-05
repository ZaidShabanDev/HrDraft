using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HrDraft.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppSettings",
                columns: table => new
                {
                    SettingKey = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    UpdatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSettings", x => x.SettingKey);
                });

            migrationBuilder.CreateTable(
                name: "LookupOptions",
                columns: table => new
                {
                    LookupOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Value = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShortLabel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    GroupLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupOptions", x => x.LookupOptionId);
                });

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    TeamId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.TeamId);
                });

            migrationBuilder.CreateTable(
                name: "Tools",
                columns: table => new
                {
                    ToolId = table.Column<int>(type: "int", nullable: false),
                    ToolKey = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayNumber = table.Column<string>(type: "varchar(4)", unicode: false, maxLength: 4, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    ShortDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SkillFileNames = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaxOutputTokens = table.Column<int>(type: "int", nullable: false),
                    RequiresHumanReview = table.Column<bool>(type: "bit", nullable: false),
                    EstimatedSeconds = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tools", x => x.ToolId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false, collation: "SQL_Latin1_General_CP1_CI_AS"),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntraObjectId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AuthSource = table.Column<byte>(type: "tinyint", nullable: false),
                    Role = table.Column<byte>(type: "tinyint", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    DailyGenerationLimit = table.Column<int>(type: "int", nullable: true),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLoginUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    AuditId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false),
                    EntityType = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: true),
                    EntityId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DetailJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.AuditId);
                    table.ForeignKey(
                        name: "FK_AuditLog_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "CompanyProfiles",
                columns: table => new
                {
                    CompanyProfileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BenefitsBlurb = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeiStatement = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CultureDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCurrent = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedByUserId = table.Column<int>(type: "int", nullable: false),
                    UpdatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyProfiles", x => x.CompanyProfileId);
                    table.ForeignKey(
                        name: "FK_CompanyProfiles_Users_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompBands",
                columns: table => new
                {
                    CompBandId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyProfileId = table.Column<int>(type: "int", nullable: false),
                    LevelCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MinAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    BonusPercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    DisplayOverride = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompBands", x => x.CompBandId);
                    table.ForeignKey(
                        name: "FK_CompBands_CompanyProfiles_CompanyProfileId",
                        column: x => x.CompanyProfileId,
                        principalTable: "CompanyProfiles",
                        principalColumn: "CompanyProfileId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Generations",
                columns: table => new
                {
                    GenerationId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ToolId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    InputJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyProfileId = table.Column<int>(type: "int", nullable: true),
                    OutputMarkdown = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EditedMarkdown = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<byte>(type: "tinyint", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ModelId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InputTokens = table.Column<int>(type: "int", nullable: true),
                    OutputTokens = table.Column<int>(type: "int", nullable: true),
                    CacheReadInputTokens = table.Column<int>(type: "int", nullable: true),
                    DurationMs = table.Column<int>(type: "int", nullable: true),
                    ParentGenerationId = table.Column<long>(type: "bigint", nullable: true),
                    IsReviewed = table.Column<bool>(type: "bit", nullable: false),
                    ReviewedByUserId = table.Column<int>(type: "int", nullable: true),
                    ReviewedUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Generations", x => x.GenerationId);
                    table.ForeignKey(
                        name: "FK_Generations_CompanyProfiles_CompanyProfileId",
                        column: x => x.CompanyProfileId,
                        principalTable: "CompanyProfiles",
                        principalColumn: "CompanyProfileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Generations_Generations_ParentGenerationId",
                        column: x => x.ParentGenerationId,
                        principalTable: "Generations",
                        principalColumn: "GenerationId");
                    table.ForeignKey(
                        name: "FK_Generations_Tools_ToolId",
                        column: x => x.ToolId,
                        principalTable: "Tools",
                        principalColumn: "ToolId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Generations_Users_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Generations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmailMessages",
                columns: table => new
                {
                    EmailMessageId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GenerationId = table.Column<long>(type: "bigint", nullable: true),
                    SentByUserId = table.Column<int>(type: "int", nullable: false),
                    FromAddress = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ToAddresses = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CcAddresses = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BodyHtml = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<byte>(type: "tinyint", nullable: false),
                    GraphMessageId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SentUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailMessages", x => x.EmailMessageId);
                    table.ForeignKey(
                        name: "FK_EmailMessages_Generations_GenerationId",
                        column: x => x.GenerationId,
                        principalTable: "Generations",
                        principalColumn: "GenerationId");
                    table.ForeignKey(
                        name: "FK_EmailMessages_Users_SentByUserId",
                        column: x => x.SentByUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GenerationRevisions",
                columns: table => new
                {
                    GenerationRevisionId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GenerationId = table.Column<long>(type: "bigint", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    Markdown = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsModelOutput = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GenerationRevisions", x => x.GenerationRevisionId);
                    table.ForeignKey(
                        name: "FK_GenerationRevisions_Generations_GenerationId",
                        column: x => x.GenerationId,
                        principalTable: "Generations",
                        principalColumn: "GenerationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GenerationRevisions_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.InsertData(
                table: "AppSettings",
                columns: new[] { "SettingKey", "Description", "SettingValue", "UpdatedUtc" },
                values: new object[,]
                {
                    { "ClaudeModelId", "Model used for every generation. Changing it needs no deploy.", "claude-sonnet-5", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "DefaultDailyGenerationLimit", "Runs per person per day when the user row does not override it.", "20", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "GenerationHistoryRetentionDays", "Age at which a draft's text is nulled. The row and its audit entries stay.", "730", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "LookupOptions",
                columns: new[] { "LookupOptionId", "Category", "GroupLabel", "IsEnabled", "Label", "ShortLabel", "SortOrder", "Value" },
                values: new object[,]
                {
                    { 1, "WorkArrangement", "Arrangement", true, "On-site", null, 1, "onsite" },
                    { 2, "WorkArrangement", "Arrangement", true, "Hybrid", null, 2, "hybrid" },
                    { 3, "WorkArrangement", "Arrangement", true, "Remote — within region", null, 3, "remote-regional" },
                    { 4, "WorkArrangement", "Arrangement", true, "Remote — anywhere", null, 4, "remote-global" },
                    { 11, "SeniorityLevel", null, true, "Junior", "Jr", 1, "junior" },
                    { 12, "SeniorityLevel", null, true, "Mid", "Mid", 2, "mid" },
                    { 13, "SeniorityLevel", null, true, "Senior", "Snr", 3, "senior" },
                    { 14, "SeniorityLevel", null, true, "Lead", "Lead", 4, "lead" },
                    { 21, "InterviewType", null, true, "Behavioral", null, 1, "behavioral" },
                    { 22, "InterviewType", null, true, "Technical", null, 2, "technical" },
                    { 23, "InterviewType", null, true, "Culture add", null, 3, "culture" }
                });

            migrationBuilder.InsertData(
                table: "Tools",
                columns: new[] { "ToolId", "Category", "Description", "DisplayName", "DisplayNumber", "EstimatedSeconds", "IsActive", "MaxOutputTokens", "RequiresHumanReview", "ShortDescription", "SkillFileNames", "SortOrder", "ToolKey" },
                values: new object[,]
                {
                    { 1, "Recruiting", "Title, seniority, must-haves → full JD with comp and inclusive closing.", "Job description", "01", 20, true, 4000, true, "Title, seniority, must-haves → full JD.", "hr-job-description/SKILL.md", 1, "job-description" },
                    { 2, "Recruiting", "Paste an old posting → debiased, restructured, inclusive.", "JD rewriter", "02", 25, true, 4000, true, "Paste an old posting → debiased.", "hr-job-description/SKILL.md", 2, "jd-rewriter" },
                    { 3, "Recruiting", "Competency set by interview type, with follow-ups.", "Interview questions", "03", 20, true, 3000, false, "Competency set with follow-ups.", "hr-interviewing/SKILL.md;hr-recruiting/prompts/writing-competency-based-interview-questions.md", 3, "interview-questions" },
                    { 4, "Recruiting", "Rating grid with strong / weak answer guidance.", "Scorecard", "04", 18, true, 3000, false, "Rating grid with answer guidance.", "hr-interviewing/SKILL.md", 4, "scorecard" },
                    { 5, "Onboarding", "Phased milestones by role, manager and goals.", "30/60/90 plan", "05", 25, true, 4000, false, "Phased milestones by role and goals.", "hr-onboarding/SKILL.md;hr-onboarding/examples/create-30-60-90-day-onboarding-plan.md", 5, "plan-30-60-90" },
                    { 6, "Onboarding", "Week-by-week, systems and equipment included.", "Onboarding checklist", "06", 20, true, 3000, false, "Week-by-week, systems included.", "hr-onboarding/SKILL.md;hr-onboarding/prompts/employee-onboarding.md", 6, "onboarding-checklist" },
                    { 7, "Onboarding", "First-day message for the team and the new hire.", "Welcome email", "07", 12, true, 1500, false, "First-day message for the new hire.", "hr-onboarding/SKILL.md", 7, "welcome-email" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_CreatedUtc",
                table: "AuditLog",
                column: "CreatedUtc",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_UserId_CreatedUtc",
                table: "AuditLog",
                columns: new[] { "UserId", "CreatedUtc" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyProfiles_UpdatedByUserId",
                table: "CompanyProfiles",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "UX_CompanyProfiles_IsCurrent",
                table: "CompanyProfiles",
                column: "IsCurrent",
                unique: true,
                filter: "[IsCurrent] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_CompBands_CompanyProfileId_SortOrder",
                table: "CompBands",
                columns: new[] { "CompanyProfileId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_CreatedUtc",
                table: "EmailMessages",
                column: "CreatedUtc",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_GenerationId",
                table: "EmailMessages",
                column: "GenerationId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_SentByUserId",
                table: "EmailMessages",
                column: "SentByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GenerationRevisions_CreatedByUserId",
                table: "GenerationRevisions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GenerationRevisions_GenerationId_VersionNumber",
                table: "GenerationRevisions",
                columns: new[] { "GenerationId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Generations_CompanyProfileId",
                table: "Generations",
                column: "CompanyProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Generations_ParentGenerationId",
                table: "Generations",
                column: "ParentGenerationId");

            migrationBuilder.CreateIndex(
                name: "IX_Generations_ReviewedByUserId",
                table: "Generations",
                column: "ReviewedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Generations_ToolId_CreatedUtc",
                table: "Generations",
                columns: new[] { "ToolId", "CreatedUtc" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Generations_UserId_CreatedUtc",
                table: "Generations",
                columns: new[] { "UserId", "CreatedUtc" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_LookupOptions_Category_Value",
                table: "LookupOptions",
                columns: new[] { "Category", "Value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_Name",
                table: "Teams",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tools_ToolKey",
                table: "Tools",
                column: "ToolKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_EntraObjectId",
                table: "Users",
                column: "EntraObjectId",
                unique: true,
                filter: "[EntraObjectId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppSettings");

            migrationBuilder.DropTable(
                name: "AuditLog");

            migrationBuilder.DropTable(
                name: "CompBands");

            migrationBuilder.DropTable(
                name: "EmailMessages");

            migrationBuilder.DropTable(
                name: "GenerationRevisions");

            migrationBuilder.DropTable(
                name: "LookupOptions");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropTable(
                name: "Generations");

            migrationBuilder.DropTable(
                name: "CompanyProfiles");

            migrationBuilder.DropTable(
                name: "Tools");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
