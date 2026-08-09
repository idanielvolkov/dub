import { HelpButton } from "../sidebar/help-button";

const toolbarItems = ["help"] as const;

type ToolbarProps = {
  show?: (typeof toolbarItems)[number][];
};

export default function Toolbar(props: ToolbarProps) {
  return (
    <div className="fixed bottom-0 right-0 z-40 m-5">
      <div className="flex items-center gap-3">
        {props.show?.includes("help") && (
          <div className="hidden shrink-0 md:block">
            <HelpButton variant="secondary" />
          </div>
        )}
      </div>
    </div>
  );
}
