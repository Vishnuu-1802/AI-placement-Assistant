import Chatbot from "./Chatbot";
import SiteShell from "./SiteShell";

function ChatbotPage() {
  return (
    <SiteShell
      title="AI Tutor"
      subtitle="Ask technical questions, clarify concepts, and get focused learning help."
    >
      <Chatbot userSkills={[]} />
    </SiteShell>
  );
}

export default ChatbotPage;

