import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function SuperviseDetailPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/supervise/${id}/detail`} />;
} 