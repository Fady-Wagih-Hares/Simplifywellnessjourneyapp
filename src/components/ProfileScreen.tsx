import { Settings, Target, Bell, User, Mail, Shield } from 'lucide-react';

export function ProfileScreen() {
  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', value: 'Update your details' },
        { icon: Mail, label: 'Email', value: 'user@example.com' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Target, label: 'Daily Goals', value: '2,000 cal, 8 glasses' },
        { icon: Bell, label: 'Reminders', value: 'Meal and water notifications' },
        { icon: Settings, label: 'App Settings', value: 'Theme and units' },
      ]
    },
    {
      title: 'Privacy',
      items: [
        { icon: Shield, label: 'Data & Privacy', value: 'Manage your data' },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-[var(--text-primary)] mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-[var(--sage-green-light)] rounded-full flex items-center justify-center mb-4">
                <span className="text-6xl">👤</span>
              </div>
              <h2 className="text-[var(--text-primary)] mb-2">Welcome!</h2>
              <p className="text-[var(--text-secondary)]">Member since Jan 2025</p>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-[var(--sage-green-light)] rounded-2xl text-center">
                <div className="text-[var(--sage-green)]">28</div>
                <div className="text-[var(--text-secondary)]">Days Active</div>
              </div>
              <div className="p-4 bg-[var(--calming-blue)]/20 rounded-2xl text-center">
                <div className="text-[var(--calming-blue)]">7</div>
                <div className="text-[var(--text-secondary)]">Current Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {profileSections.map((section, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-[var(--text-primary)] mb-4">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button key={idx} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--sage-green-light)] transition-colors text-left">
                      <Icon className="w-5 h-5 text-[var(--sage-green)]" />
                      <div className="flex-1">
                        <div className="text-[var(--text-primary)]">{item.label}</div>
                        <div className="text-[var(--text-secondary)]">{item.value}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}