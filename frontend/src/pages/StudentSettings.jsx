import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const STORAGE_KEY = 'classroom_student_settings'

const defaultSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  digestFrequency: 'daily',
  timezone: 'America/Los_Angeles',
  language: 'en',
  darkMode: true,
}

function loadSettings() {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    return { ...defaultSettings, ...parsed }
  } catch {
    return defaultSettings
  }
}

function saveSettings(settings) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

function Toggle({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-gray-600' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export function StudentSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(defaultSettings)
  const [status, setStatus] = useState(null)
  const initials =
    user?.initials ||
    user?.name
      ?.split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    '?'

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings(settings)
    setStatus('Settings saved')
    window.setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your profile, notifications, and display preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-lg">
              {initials}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'Student'}</p>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Display name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <p className="text-xs text-gray-500 mb-3">
            Choose how you&apos;d like to be notified about new announcements, grades, and inbox
            messages.
          </p>
          <div className="space-y-2">
            <Toggle
              id="emailNotifications"
              label="Email notifications"
              description="Get an email when there are new announcements, assignments, or grades."
              checked={settings.emailNotifications}
              onChange={(v) => handleChange('emailNotifications', v)}
            />
            <Toggle
              id="pushNotifications"
              label="Push notifications"
              description="Allow Classroom to send push notifications to your devices."
              checked={settings.pushNotifications}
              onChange={(v) => handleChange('pushNotifications', v)}
            />
            <Toggle
              id="smsNotifications"
              label="SMS notifications"
              description="Receive important alerts via text message."
              checked={settings.smsNotifications}
              onChange={(v) => handleChange('smsNotifications', v)}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Notification summary
              </label>
              <select
                value={settings.digestFrequency}
                onChange={(e) => handleChange('digestFrequency', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="realtime">Send as soon as possible</option>
                <option value="hourly">Hourly summary</option>
                <option value="daily">Daily summary</option>
                <option value="weekly">Weekly summary</option>
              </select>
            </div>
          </div>
        </section>

        {/* Display & locale */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Display &amp; locale</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Time zone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="America/Los_Angeles">(UTC-08:00) Pacific Time (US & Canada)</option>
                <option value="America/Denver">(UTC-07:00) Mountain Time (US & Canada)</option>
                <option value="America/Chicago">(UTC-06:00) Central Time (US & Canada)</option>
                <option value="America/New_York">(UTC-05:00) Eastern Time (US & Canada)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="en">English (US)</option>
                <option value="en-uk">English (UK)</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <Toggle
              id="darkMode"
              label="Enable dark mode"
              description="Use the dark theme for Classroom when available."
              checked={settings.darkMode}
              onChange={(v) => handleChange('darkMode', v)}
            />
          </div>
        </section>

        {/* Actions */} 
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500">
            These preferences are stored in your browser for this prototype experience.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          >
            Save changes
          </button>
        </div>
      </form>

      {status && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {status}
        </div>
      )}
    </div>
  )
}

