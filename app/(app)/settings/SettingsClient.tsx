'use client'

import { useState } from 'react'
import { saveSettings } from './actions'

type Settings = { madrasa_name: string; contact_number: string | null; address: string | null; currency: string } | null

export default function SettingsClient({ settings, canEdit, loadError }: { settings: Settings; canEdit: boolean; loadError?: string }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(formData: FormData) {
    setSaving(true)
    setSaved(false)
    await saveSettings(formData)
    setSaving(false)
    setSaved(true)
  }

  if (loadError) return <div className="bg-danger-bg text-danger text-[13px] rounded-[9px] px-3 py-2">ترتیبات لوڈ نہیں ہو سکیں: {loadError}</div>

  return (
    <div className="bg-surface border border-border rounded-card shadow-sm p-[18px_20px]">
      <form action={handleSave} className="grid grid-cols-2 gap-3">
        <F label="مدرسے کا نام" name="madrasa_name" defaultValue={settings?.madrasa_name} disabled={!canEdit} />
        <F label="رابطہ نمبر" name="contact_number" defaultValue={settings?.contact_number || ''} disabled={!canEdit} />
        <F label="پتہ" name="address" defaultValue={settings?.address || ''} disabled={!canEdit} />
        <F label="کرنسی" name="currency" defaultValue={settings?.currency} disabled={!canEdit} />
        {canEdit && (
          <div className="col-span-2 mt-2">
            <button type="submit" disabled={saving} className="bg-primary text-white rounded-[9px] px-4 py-[9px] text-[13px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
              {saving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
            </button>
            {saved && <span className="text-[12.5px] text-income ml-3">محفوظ ہو گیا۔</span>}
          </div>
        )}
      </form>
      {!canEdit && <p className="text-[11.5px] text-muted mt-4">صرف مہتمم ان ترتیبات میں ترمیم کر سکتے ہیں۔</p>}
    </div>
  )
}

function F({ label, name, defaultValue, disabled }: { label: string; name: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <div className="field">
      <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-wide mb-[5px]">{label}</label>
      <input name={name} defaultValue={defaultValue} disabled={disabled} className="w-full px-3 py-[9px] border border-border rounded-[8px] text-[13px] bg-[#FEFDFA] disabled:opacity-70" />
    </div>
  )
}
