import { StepPage } from "../step-page";
import { Form } from "./form";

export default function Workspace() {
  return (
    <StepPage
      title="Create your workspace"
      description={
        <>
          Your team will manage VPN subscribers, servers, operations, and growth
          here.
        </>
      }
    >
      <Form />
    </StepPage>
  );
}
