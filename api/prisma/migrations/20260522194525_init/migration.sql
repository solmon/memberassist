BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Tenant] (
    [id] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [slug] NVARCHAR(100) NOT NULL,
    [logoUrl] NVARCHAR(max),
    [primaryColour] NVARCHAR(7),
    [isActive] BIT NOT NULL CONSTRAINT [Tenant_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tenant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Tenant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Tenant_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[District] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(max),
    [isActive] BIT NOT NULL CONSTRAINT [District_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [District_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [District_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Broker] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [licenceNumber] NVARCHAR(50) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(20),
    [isActive] BIT NOT NULL CONSTRAINT [Broker_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Broker_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Broker_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Member] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [districtId] NVARCHAR(36),
    [email] NVARCHAR(255) NOT NULL,
    [passwordHash] NVARCHAR(max) NOT NULL,
    [firstName] NVARCHAR(100) NOT NULL,
    [lastName] NVARCHAR(100) NOT NULL,
    [dateOfBirth] DATETIME2 NOT NULL,
    [memberIdNumber] NVARCHAR(50) NOT NULL,
    [phone] NVARCHAR(20),
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [Member_role_df] DEFAULT 'MEMBER',
    [isActive] BIT NOT NULL CONSTRAINT [Member_isActive_df] DEFAULT 1,
    [lastLoginAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Member_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Member_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Member_memberIdNumber_key] UNIQUE NONCLUSTERED ([memberIdNumber])
);

-- CreateTable
CREATE TABLE [dbo].[RefreshToken] (
    [id] NVARCHAR(36) NOT NULL,
    [memberId] NVARCHAR(36) NOT NULL,
    [tokenHash] NVARCHAR(max) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [revokedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RefreshToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RefreshToken_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PlanEnrollment] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [memberId] NVARCHAR(36) NOT NULL,
    [planName] NVARCHAR(255) NOT NULL,
    [planTier] NVARCHAR(20) NOT NULL,
    [groupNumber] NVARCHAR(50) NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [terminationDate] DATETIME2,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [PlanEnrollment_status_df] DEFAULT 'ACTIVE',
    [premiumAmount] DECIMAL(10,2) NOT NULL,
    [premiumCycle] NVARCHAR(20) NOT NULL CONSTRAINT [PlanEnrollment_premiumCycle_df] DEFAULT 'MONTHLY',
    [nextRenewalDate] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PlanEnrollment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PlanEnrollment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Dependent] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [memberId] NVARCHAR(36) NOT NULL,
    [firstName] NVARCHAR(100) NOT NULL,
    [lastName] NVARCHAR(100) NOT NULL,
    [dateOfBirth] DATETIME2 NOT NULL,
    [relationship] NVARCHAR(30) NOT NULL,
    [memberIdNumber] NVARCHAR(50) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Dependent_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Dependent_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Dependent_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Dependent_memberIdNumber_key] UNIQUE NONCLUSTERED ([memberIdNumber])
);

-- CreateTable
CREATE TABLE [dbo].[DigitalInsuranceCard] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [enrollmentId] NVARCHAR(36) NOT NULL,
    [dependentId] NVARCHAR(36),
    [cardholderName] NVARCHAR(255) NOT NULL,
    [memberIdNumber] NVARCHAR(50) NOT NULL,
    [groupNumber] NVARCHAR(50) NOT NULL,
    [planName] NVARCHAR(255) NOT NULL,
    [planTier] NVARCHAR(20) NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [terminationDate] DATETIME2,
    [issuedAt] DATETIME2 NOT NULL CONSTRAINT [DigitalInsuranceCard_issuedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DigitalInsuranceCard_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CommunicationMessage] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [channel] NVARCHAR(30) NOT NULL,
    [brokerId] NVARCHAR(36),
    [districtId] NVARCHAR(36),
    [recipientMemberId] NVARCHAR(36),
    [subject] NVARCHAR(500) NOT NULL,
    [body] NVARCHAR(max) NOT NULL,
    [sentAt] DATETIME2 NOT NULL CONSTRAINT [CommunicationMessage_sentAt_df] DEFAULT CURRENT_TIMESTAMP,
    [readAt] DATETIME2,
    CONSTRAINT [CommunicationMessage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MarketplaceOffer] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [category] NVARCHAR(20) NOT NULL,
    [eligibleTiers] NVARCHAR(max) NOT NULL,
    [priceAmount] DECIMAL(10,2),
    [priceCycle] NVARCHAR(20),
    [isActive] BIT NOT NULL CONSTRAINT [MarketplaceOffer_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MarketplaceOffer_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [MarketplaceOffer_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MarketplaceInterest] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [offerId] NVARCHAR(36) NOT NULL,
    [enrollmentId] NVARCHAR(36) NOT NULL,
    [expressedAt] DATETIME2 NOT NULL CONSTRAINT [MarketplaceInterest_expressedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [MarketplaceInterest_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MarketplaceInterest_offerId_enrollmentId_key] UNIQUE NONCLUSTERED ([offerId],[enrollmentId])
);

-- CreateTable
CREATE TABLE [dbo].[HealthEvent] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [category] NVARCHAR(30) NOT NULL,
    [location] NVARCHAR(500),
    [isVirtual] BIT NOT NULL CONSTRAINT [HealthEvent_isVirtual_df] DEFAULT 0,
    [meetingUrl] NVARCHAR(max),
    [startAt] DATETIME2 NOT NULL,
    [endAt] DATETIME2 NOT NULL,
    [capacity] INT,
    [isActive] BIT NOT NULL CONSTRAINT [HealthEvent_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [HealthEvent_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [HealthEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EventRsvp] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [eventId] NVARCHAR(36) NOT NULL,
    [memberId] NVARCHAR(36) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [EventRsvp_status_df] DEFAULT 'ATTENDING',
    [registeredAt] DATETIME2 NOT NULL CONSTRAINT [EventRsvp_registeredAt_df] DEFAULT CURRENT_TIMESTAMP,
    [cancelledAt] DATETIME2,
    CONSTRAINT [EventRsvp_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EventRsvp_eventId_memberId_key] UNIQUE NONCLUSTERED ([eventId],[memberId])
);

-- CreateTable
CREATE TABLE [dbo].[Provider] (
    [id] NVARCHAR(36) NOT NULL,
    [tenantId] NVARCHAR(36) NOT NULL,
    [npi] NVARCHAR(20) NOT NULL,
    [firstName] NVARCHAR(100) NOT NULL,
    [lastName] NVARCHAR(100) NOT NULL,
    [specialty] NVARCHAR(255) NOT NULL,
    [clinicName] NVARCHAR(255),
    [address] NVARCHAR(max) NOT NULL,
    [city] NVARCHAR(100) NOT NULL,
    [state] NVARCHAR(50) NOT NULL,
    [zipCode] NVARCHAR(10) NOT NULL,
    [phone] NVARCHAR(20),
    [acceptingNew] BIT NOT NULL CONSTRAINT [Provider_acceptingNew_df] DEFAULT 1,
    [networkTiers] NVARCHAR(max) NOT NULL,
    [latitude] DECIMAL(9,6),
    [longitude] DECIMAL(9,6),
    [isActive] BIT NOT NULL CONSTRAINT [Provider_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Provider_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Provider_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tenant_slug_idx] ON [dbo].[Tenant]([slug]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tenant_isActive_idx] ON [dbo].[Tenant]([isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [District_tenantId_idx] ON [dbo].[District]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [District_tenantId_isActive_idx] ON [dbo].[District]([tenantId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Broker_tenantId_idx] ON [dbo].[Broker]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Broker_tenantId_isActive_idx] ON [dbo].[Broker]([tenantId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Broker_email_idx] ON [dbo].[Broker]([email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_tenantId_idx] ON [dbo].[Member]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_tenantId_email_idx] ON [dbo].[Member]([tenantId], [email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_tenantId_isActive_idx] ON [dbo].[Member]([tenantId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Member_memberIdNumber_idx] ON [dbo].[Member]([memberIdNumber]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RefreshToken_memberId_idx] ON [dbo].[RefreshToken]([memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RefreshToken_memberId_revokedAt_idx] ON [dbo].[RefreshToken]([memberId], [revokedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlanEnrollment_tenantId_idx] ON [dbo].[PlanEnrollment]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlanEnrollment_memberId_idx] ON [dbo].[PlanEnrollment]([memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlanEnrollment_tenantId_status_idx] ON [dbo].[PlanEnrollment]([tenantId], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlanEnrollment_memberId_status_idx] ON [dbo].[PlanEnrollment]([memberId], [status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Dependent_tenantId_idx] ON [dbo].[Dependent]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Dependent_memberId_idx] ON [dbo].[Dependent]([memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Dependent_tenantId_memberId_idx] ON [dbo].[Dependent]([tenantId], [memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Dependent_tenantId_isActive_idx] ON [dbo].[Dependent]([tenantId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DigitalInsuranceCard_tenantId_idx] ON [dbo].[DigitalInsuranceCard]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DigitalInsuranceCard_enrollmentId_idx] ON [dbo].[DigitalInsuranceCard]([enrollmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DigitalInsuranceCard_dependentId_idx] ON [dbo].[DigitalInsuranceCard]([dependentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommunicationMessage_tenantId_idx] ON [dbo].[CommunicationMessage]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommunicationMessage_tenantId_channel_idx] ON [dbo].[CommunicationMessage]([tenantId], [channel]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommunicationMessage_tenantId_recipientMemberId_idx] ON [dbo].[CommunicationMessage]([tenantId], [recipientMemberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommunicationMessage_tenantId_recipientMemberId_readAt_idx] ON [dbo].[CommunicationMessage]([tenantId], [recipientMemberId], [readAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MarketplaceOffer_tenantId_idx] ON [dbo].[MarketplaceOffer]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MarketplaceOffer_tenantId_isActive_idx] ON [dbo].[MarketplaceOffer]([tenantId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MarketplaceOffer_tenantId_category_idx] ON [dbo].[MarketplaceOffer]([tenantId], [category]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MarketplaceInterest_tenantId_idx] ON [dbo].[MarketplaceInterest]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MarketplaceInterest_offerId_idx] ON [dbo].[MarketplaceInterest]([offerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MarketplaceInterest_enrollmentId_idx] ON [dbo].[MarketplaceInterest]([enrollmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HealthEvent_tenantId_idx] ON [dbo].[HealthEvent]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HealthEvent_tenantId_startAt_idx] ON [dbo].[HealthEvent]([tenantId], [startAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [HealthEvent_tenantId_isActive_idx] ON [dbo].[HealthEvent]([tenantId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EventRsvp_tenantId_idx] ON [dbo].[EventRsvp]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EventRsvp_eventId_idx] ON [dbo].[EventRsvp]([eventId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EventRsvp_memberId_idx] ON [dbo].[EventRsvp]([memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EventRsvp_tenantId_memberId_idx] ON [dbo].[EventRsvp]([tenantId], [memberId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Provider_tenantId_idx] ON [dbo].[Provider]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Provider_tenantId_acceptingNew_idx] ON [dbo].[Provider]([tenantId], [acceptingNew]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Provider_tenantId_specialty_idx] ON [dbo].[Provider]([tenantId], [specialty]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Provider_npi_idx] ON [dbo].[Provider]([npi]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Provider_zipCode_idx] ON [dbo].[Provider]([zipCode]);

-- AddForeignKey
ALTER TABLE [dbo].[District] ADD CONSTRAINT [District_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Broker] ADD CONSTRAINT [Broker_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Member] ADD CONSTRAINT [Member_districtId_fkey] FOREIGN KEY ([districtId]) REFERENCES [dbo].[District]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RefreshToken] ADD CONSTRAINT [RefreshToken_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PlanEnrollment] ADD CONSTRAINT [PlanEnrollment_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Dependent] ADD CONSTRAINT [Dependent_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[Member]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DigitalInsuranceCard] ADD CONSTRAINT [DigitalInsuranceCard_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[PlanEnrollment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DigitalInsuranceCard] ADD CONSTRAINT [DigitalInsuranceCard_dependentId_fkey] FOREIGN KEY ([dependentId]) REFERENCES [dbo].[Dependent]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CommunicationMessage] ADD CONSTRAINT [CommunicationMessage_brokerId_fkey] FOREIGN KEY ([brokerId]) REFERENCES [dbo].[Broker]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CommunicationMessage] ADD CONSTRAINT [CommunicationMessage_districtId_fkey] FOREIGN KEY ([districtId]) REFERENCES [dbo].[District]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MarketplaceOffer] ADD CONSTRAINT [MarketplaceOffer_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MarketplaceInterest] ADD CONSTRAINT [MarketplaceInterest_offerId_fkey] FOREIGN KEY ([offerId]) REFERENCES [dbo].[MarketplaceOffer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MarketplaceInterest] ADD CONSTRAINT [MarketplaceInterest_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[PlanEnrollment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HealthEvent] ADD CONSTRAINT [HealthEvent_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[EventRsvp] ADD CONSTRAINT [EventRsvp_eventId_fkey] FOREIGN KEY ([eventId]) REFERENCES [dbo].[HealthEvent]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Provider] ADD CONSTRAINT [Provider_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[Tenant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
