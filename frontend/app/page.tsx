export default function CommandCenter() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-3xl font-bold">🏥 HOSPITAL OS - COMMAND CENTER</h1>
      <p className="text-slate-400 mt-2">Real-time overview • Enterprise Edition</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-slate-400">Total Patients</h3>
          <p className="text-4xl font-bold mt-2">1,248</p>
          <span className="text-green-400 text-sm">+12% today</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-slate-400">Available Beds</h3>
          <p className="text-4xl font-bold mt-2">32 / 150</p>
          <span className="text-red-400 text-sm">Critical</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-slate-400">Doctors On Duty</h3>
          <p className="text-4xl font-bold mt-2">18</p>
          <span className="text-blue-400 text-sm">Live</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-slate-400">Revenue Today</h3>
          <p className="text-4xl font-bold mt-2">₦2.4M</p>
          <span className="text-green-400 text-sm">Pulse: High</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 col-span-2">
          <h2 className="font-bold">Unique Tabs - Coming Next:</h2>
          <ul className="mt-3 text-sm text-slate-300 list-disc ml-5 space-y-1">
            <li>✅ Command Center (Done)</li>
            <li>⏳ Patient Timeline (Facebook-style health history)</li>
            <li>⏳ AI Scribe (Voice to notes)</li>
            <li>⏳ Revenue Pulse (Trading dashboard)</li>
            <li>⏳ Audit Vault (Who viewed what)</li>
          </ul>
        </div>
        <div className="bg-blue-600 p-5 rounded-xl">
          <h2 className="font-bold">Go Auth Service</h2>
          <p className="text-sm mt-2 opacity-80">6 Roles: ADMIN, DOCTOR, NURSE, RECEPTIONIST, LAB_TECH, PHARMACIST</p>
          <p className="text-xs mt-4 bg-black/20 p-2 rounded">JWT + 2FA + RBAC Secured</p>
        </div>
      </div>
    </main>
  );
}