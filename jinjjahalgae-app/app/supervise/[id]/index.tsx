import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";
import { useLocalSearchParams } from "expo-router";

export default function SuperviseDetailPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/supervise/${id}`} />;
}
