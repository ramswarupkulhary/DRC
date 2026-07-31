export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted mt-1">Site configuration and preferences</p>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-tan">Admin Credentials</h3>
        <p className="text-sm text-muted">
          Default admin login: <strong className="text-foreground">admin@dirtridecamp.com</strong> / <strong className="text-foreground">admin123</strong>
        </p>
        <p className="text-xs text-error">Change this password before going to production!</p>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-tan">Payment Gateway</h3>
        <p className="text-sm text-muted">
          Razorpay integration is prepared. Add your <code className="text-orange">RAZORPAY_KEY_ID</code> and <code className="text-orange">RAZORPAY_KEY_SECRET</code> to the <code>.env</code> file to enable payments.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-tan">Contact Info</h3>
        <p className="text-sm text-muted">
          WhatsApp: +91 94148 70102<br />
          Instagram: @dirtridecamp<br />
          Email: info@dirtridecamp.com
        </p>
      </div>
    </div>
  );
}
