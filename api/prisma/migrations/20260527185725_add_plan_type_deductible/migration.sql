BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[PlanEnrollment] ADD [deductibleLimit] DECIMAL(10,2),
[deductibleMet] DECIMAL(10,2) CONSTRAINT [PlanEnrollment_deductibleMet_df] DEFAULT 0,
[planType] NVARCHAR(20) NOT NULL CONSTRAINT [PlanEnrollment_planType_df] DEFAULT 'MEDICAL';

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlanEnrollment_tenantId_planType_idx] ON [dbo].[PlanEnrollment]([tenantId], [planType]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
