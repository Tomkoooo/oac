import { getRules } from "@/lib/rules";
import ManualContent from "./ManualContent";

export const dynamic = "force-dynamic";

export default async function ManualPage() {
  const rules = await getRules();
  
  return <ManualContent rules={rules} />;
}
