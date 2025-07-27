import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractEditPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/contracts/${id}/edit`} />;
} 