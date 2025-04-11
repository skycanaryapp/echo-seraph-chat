
import { ReactNode } from "react";

declare module "@/components/ChatHeader" {
  export interface ChatHeaderProps {
    title?: string;
    onClearChat?: () => void;
    children?: ReactNode;
  }

  export default function ChatHeader(props: ChatHeaderProps): JSX.Element;
}
