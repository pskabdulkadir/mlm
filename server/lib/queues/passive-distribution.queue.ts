import { startPassiveDistribution } from "../cron/passive-distribution";

export async function initializePassiveDistributionScheduler() {
  console.log("Passive distribution scheduler initializing (autonomous)...");
  try {
    startPassiveDistribution();
    console.log("Passive distribution scheduler initialized successfully via Otonom Sistem Beyni!");
  } catch (err) {
    console.error("Failed to start autonomous passive distribution scheduler:", err);
  }
  return true;
}

export const passiveDistributionQueue = {
  add: async (name: string, data: any) => {
    console.log(`Job added to passive distribution queue (${name}):`, data);
    return { id: "mock-job-id" };
  }
};
