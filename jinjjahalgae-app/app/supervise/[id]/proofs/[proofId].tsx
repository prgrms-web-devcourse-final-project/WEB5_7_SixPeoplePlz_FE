import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";
import { useLocalSearchParams } from "expo-router";

export default function SuperviseProofDetailPage() {
  const { id, proofId } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/supervise/${id}/proofs/${proofId}`} />;
}
