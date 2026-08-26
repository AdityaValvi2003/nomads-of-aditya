-- Add editable About page content
ALTER TABLE "SiteSettings"
ADD COLUMN IF NOT EXISTS "aboutHeadline" TEXT,
ADD COLUMN IF NOT EXISTS "aboutLead" TEXT,
ADD COLUMN IF NOT EXISTS "aboutStoryTitle" TEXT,
ADD COLUMN IF NOT EXISTS "aboutStoryLeft" TEXT,
ADD COLUMN IF NOT EXISTS "aboutStoryRight" TEXT,
ADD COLUMN IF NOT EXISTS "aboutPhilosophy" TEXT,
ADD COLUMN IF NOT EXISTS "aboutFreedom" TEXT,
ADD COLUMN IF NOT EXISTS "aboutExploration" TEXT,
ADD COLUMN IF NOT EXISTS "aboutPeople" TEXT,
ADD COLUMN IF NOT EXISTS "aboutGrowth" TEXT;

-- Encounter media is intentionally not unique.
DROP INDEX IF EXISTS "Encounter_mediaId_key";
