import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractCreatedPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/contracts/${id}/created`} />;
} 