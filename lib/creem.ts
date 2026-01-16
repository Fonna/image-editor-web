import { Creem } from "creem";

// Use Test API (serverIdx: 1) if strictly in development mode, 
// otherwise use Production API (serverIdx: 0).
const useTestApi = process.env.NODE_ENV === "development" || process.env.CREEM_USE_TEST_API === "true";

export const creem = new Creem({
  serverIdx: useTestApi ? 1 : 0,
});