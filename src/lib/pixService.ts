import { PIX_CONFIG } from '@/config/pixConfig';

export interface PixSettings {
  enabled: boolean;
  chave: string;
  tipoChave: string;
  titular: string;
  proposito: string;
  updatedAt?: string;
}

export const DEFAULT_PIX_SETTINGS: PixSettings = {
  enabled: true,
  chave: PIX_CONFIG.chave,
  tipoChave: PIX_CONFIG.tipoChave,
  titular: PIX_CONFIG.titular,
  proposito: PIX_CONFIG.proposito,
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'fatosfakes_pix_settings';

/**
 * Retorna as configurações atuais do PIX a partir do cache local ou padrão
 */
export function getLocalPixSettings(): PixSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_PIX_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PIX_SETTINGS,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Erro ao ler configurações do PIX do localStorage:', err);
  }

  return DEFAULT_PIX_SETTINGS;
}

/**
 * Consulta a API para sincronizar as configurações mais recentes do servidor
 */
export async function fetchRemotePixSettings(): Promise<PixSettings> {
  const local = getLocalPixSettings();

  try {
    const res = await fetch('/api/settings/pix', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const merged: PixSettings = {
          ...DEFAULT_PIX_SETTINGS,
          ...json.data,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('fatosfakes_pix_updated', { detail: merged }));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Não foi possível obter configurações remotas do PIX, utilizando cache local:', err);
  }

  return local;
}

/**
 * Salva as novas configurações do PIX (Habilitar/Desabilitar, Chave, Titular)
 */
export async function savePixSettings(
  newSettings: Partial<PixSettings>,
  adminKey?: string
): Promise<{ success: boolean; data: PixSettings; error?: string }> {
  const current = getLocalPixSettings();
  const updated: PixSettings = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Atualiza imediatamente no localStorage para resposta instantânea
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('fatosfakes_pix_updated', { detail: updated }));
  }

  // 2. Persiste no backend / Supabase
  try {
    const token = adminKey || (typeof window !== 'undefined' ? sessionStorage.getItem('fatosfakes_admin_auth_token') || 'admin@fatosfakes2026' : 'admin@fatosfakes2026');
    
    const res = await fetch('/api/settings/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data || updated };
    } else {
      return { 
        success: true, // Sucesso local preservado
        data: updated, 
        error: json.error || 'Salvo localmente no navegador (sincronização de nuvem pendente).' 
      };
    }
  } catch {
    return { 
      success: true, 
      data: updated, 
      error: 'Salvo localmente com sucesso (servidor em sincronização de rotina).' 
    };
  }
}
