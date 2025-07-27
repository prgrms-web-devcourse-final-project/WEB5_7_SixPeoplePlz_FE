import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function SuperviseProofDetailPage() {
  const { id, proofId } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/supervise/${id}/detail/${proofId}`} />;
} 