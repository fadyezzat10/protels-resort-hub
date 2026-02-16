import CMSLayout from "./CMSLayout";
import CMSAssistant from "@/components/CMSAssistant";

export default function CMSAIAssistant() {
  return (
    <CMSLayout>
      <div className="max-w-4xl mx-auto" style={{ height: "calc(100vh - 140px)" }}>
        <CMSAssistant mode="fullpage" />
      </div>
    </CMSLayout>
  );
}
