// scripts/validate-env.js
// Deployment validation script for Vercel and AI Studio environments

const apiKey = 
  process.env.GEMINI_API_KEY || 
  process.env.VITE_GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  process.env.API_KEY;

console.log("\n================================================================================");
console.log("             VORYNEXA / PLACEMENTOS DEPLOYMENT ENVIRONMENT CHECK               ");
console.log("================================================================================");

if (apiKey) {
  const maskedKey = apiKey.substring(0, 6) + "..." + apiKey.substring(apiKey.length - 4);
  console.log(`[SUCCESS] GEMINI_API_KEY is configured correctly (${maskedKey}).`);
  console.log("================================================================================\n");
} else {
  console.error("================================================================================");
  console.error("[WARNING / ACTION REQUIRED] GEMINI_API_KEY environment variable is missing!");
  console.error("--------------------------------------------------------------------------------");
  console.error("The build will complete to ensure the frontend application remains accessible,");
  console.error("but AI career intelligence features will require an API key to run.");
  console.error("\nTO FIX THIS ON VERCEL:");
  console.error("  1. Go to your Vercel Dashboard (https://vercel.com)");
  console.error("  2. Navigate to: Your Project -> Settings -> Environment Variables");
  console.error("  3. Add a new variable:");
  console.error("       Key:   GEMINI_API_KEY (or VITE_GEMINI_API_KEY)");
  console.error("       Value: Your Google AI Studio API Key");
  console.error("              (Get a free key at: https://aistudio.google.com/app/apikey)");
  console.error("  4. Redeploy your Vercel project.");
  console.error("================================================================================\n");
}

// Always exit with status 0 to prevent breaking frontend build deployment
process.exit(0);
