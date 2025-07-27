import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function InvitePage() {
  const { code } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/invite/${code}`} />;
} 