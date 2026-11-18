import type { ChatSettings } from '../types'

const KEY = 'chatweb:settings:v1'

export function loadSettings(): ChatSettings | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as ChatSettings
    return saved.provider === 'zibb-teste' ? { ...saved, apiBaseUrl: '' } : saved
  } catch {
    return null
  }
}

export function saveSettings(s: ChatSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function clearSettings(): void {
  localStorage.removeItem(KEY)
}

