import { prisma } from "../lib/prisma.js";
import {
  backfillCompanyLogos,
  backfillCountryEligibilityFromStoredLocations,
} from "../opportunities/countryBackfill.js";

const country = await backfillCountryEligibilityFromStoredLocations();
const logos = await backfillCompanyLogos();
console.log(
  JSON.stringify(
    {
      country,
      logos,
    },
    null,
    2,
  ),
);
await prisma.$disconnect();
