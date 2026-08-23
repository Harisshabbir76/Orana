"use client";

import { HomepageCMSProvider } from "../context/HomepageCMSContext";

export default function HomepageCMSWrapper({ children }: { children: React.ReactNode }) {
  return <HomepageCMSProvider>{children}</HomepageCMSProvider>;
}
