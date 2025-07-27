# Jinjahalgae WebView Pages

This document describes the webview pages that wrap the Jinjahalgae web application.

## Components

### JinjahalgaeWebView
The main webview component that loads the Jinjahalgae web application. It includes:
- Back navigation handling for Android
- Message handling for web-to-native communication
- URL handling for localhost to emulator address conversion

### WebviewProvider
Context provider for managing webview references.



## WebView Pages

The following pages are available in the app and match the Next.js app router structure:

### Static Pages
- `/auth` - Auth page
- `/login/oauth2/code/kakao` - Kakao OAuth callback page
- `/login/oauth2/code/naver` - Naver OAuth callback page
- `/contracts/create` - Contract creation page
- `/profile` - Profile page
- `/profile/history` - Profile history page
- `/profile/info` - Profile info page
- `/notifications` - Notifications page
- `/webview-test` - Test page (loads root path)

### Dynamic Pages
- `/contracts/[id]` - Contract detail page with dynamic id
- `/contracts/[id]/preview` - Contract preview page with dynamic id
- `/contracts/[id]/proofs/[proofId]` - Contract proof detail page with dynamic id and proofId
- `/contracts/[id]/created` - Contract created page with dynamic id
- `/contracts/[id]/edit` - Contract edit page with dynamic id
- `/supervise/[id]` - Supervise detail page with dynamic id
- `/supervise/[id]/detail` - Supervise detail page with dynamic id
- `/supervise/[id]/detail/[proofId]` - Supervise proof detail page with dynamic id and proofId
- `/invite/[code]` - Invite page with dynamic code

## Usage

Each page uses the `JinjahalgaeWebView` component with a specific path:

```tsx
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractsCreatePage() {
  return <JinjahalgaeWebView path="/contracts/create" />;
}
```

For dynamic routes, use `useLocalSearchParams`:

```tsx
import { useLocalSearchParams } from "expo-router";
import JinjahalgaeWebView from "@/components/jinjahalgae-web-view";

export default function ContractDetailPage() {
  const { id } = useLocalSearchParams();
  return <JinjahalgaeWebView path={`/contracts/${id}`} />;
}
```

## Configuration

The webview is configured to:
- Connect to `http://10.0.2.2:3000` (Android emulator localhost)
- Use custom user agent: `jinjahalgae-webview-agent`
- Handle back navigation appropriately
- Support web-to-native messaging
- Handle external URLs (OAuth, external links) by opening them in the device's default browser

## Navigation

All webview pages are configured with `headerShown: false` to provide a full-screen webview experience. 