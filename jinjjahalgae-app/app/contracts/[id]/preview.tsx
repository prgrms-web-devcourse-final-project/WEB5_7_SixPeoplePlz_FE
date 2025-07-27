import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractPreviewPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/contracts/${id}/preview`} />;
} 