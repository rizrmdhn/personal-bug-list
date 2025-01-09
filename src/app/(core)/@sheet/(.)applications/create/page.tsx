import CreateApplicationForm from "@/components/create-application-form";
import Sheets from "@/components/sheets";
import { SheetTitle } from "@/components/ui/sheet";

export default function CreateApplications() {
  return (
    <Sheets className="max-w-lg xl:w-full">
      <div className="flex flex-col gap-4">
        <SheetTitle className="text-3xl font-bold">
          Add a new applications
        </SheetTitle>
        <CreateApplicationForm />
      </div>
    </Sheets>
  );
}
