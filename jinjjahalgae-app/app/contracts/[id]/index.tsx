import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractDetailPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/contracts/${id}`} />;
} 