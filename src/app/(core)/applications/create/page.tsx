import CreateApplicationForm from "@/components/create-application-form";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 xl:p-4">
      <h1 className="self-start text-3xl font-bold">Add a new appliacions</h1>
      <CreateApplicationForm />
    </div>
  );
}
