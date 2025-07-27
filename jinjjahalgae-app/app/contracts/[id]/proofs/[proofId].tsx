import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractProofDetailPage() {
  const { id, proofId } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/contracts/${id}/proofs/${proofId}`} />;
} 