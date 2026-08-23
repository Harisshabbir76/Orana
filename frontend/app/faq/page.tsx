import QuestionAnswer from "../components/faq/QuestionAnswer";
import StillHaveQuestions from "../components/faq/StillHaveQuestions";
import Destination from "../components/homepage/Destination";
import Instagram from "../components/homepage/Instagram";
import { PageCMSProvider } from "../context/PageCMSContext";

export default function FAQPage() {
  return (
    <PageCMSProvider page="faq">
      <QuestionAnswer />
      <StillHaveQuestions />
      <br/>
      <Destination/>
      <Instagram/>
    </PageCMSProvider>
  );
}
