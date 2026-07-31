import RideForm from "@/components/admin/RideForm";

export default function NewRidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">New Ride</h1>
        <p className="text-muted mt-1">Create a new ride or event</p>
      </div>
      <RideForm />
    </div>
  );
}
