function parseNum(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

const PRIMARY_API = 'https://adaptive-upssfeg.onrender.com';
const FALLBACK_API = 'http://localhost:5000';

class ApiService {
  constructor(baseUrl = PRIMARY_API) {
    this.baseUrl = baseUrl;
  }

  async _request(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async fetchSensorData() {
    const data = await this._request('/data');
    const c1 = parseNum(data.current1, 0);
    const c2 = parseNum(data.current2, 0);
    const totalC = parseNum(data.current, c1 + c2);
    return {
      temperature: parseNum(data.temperature, 25),
      humidity: parseNum(data.humidity, 50),
      distance: parseNum(data.distance, 100),
      battery: parseNum(data.battery, 100),
      inputVoltage: parseNum(data.inputVoltage, 220),
      current: totalC,
      current1: c1,
      current2: c2,
    };
  }

  async fetchLoads() {
    const map = await this._request('/loads');
    return {
      load1: map.load1 === true,
      load2: map.load2 === true,
      supply: map.supply === true || map.source === true,
      source: map.source === true || map.supply === true,
      battSupply: map.battSupply === true || map['4'] === true,
      charger: map.charger === true || map['5'] === true,
      espOnline: map.espOnline === true,
      lastEspSeen: map.lastEspSeen || null,
    };
  }

  async setLoadState(id, targetState = null) {
    const target =
      id === 3 || id === '3' || id === 'supply' || id === 'source'
        ? 'supply'
        : id === 4 || id === '4' || id === 'battSupply' || id === 'battery'
        ? 'battSupply'
        : id === 5 || id === '5' || id === 'charger'
        ? 'charger'
        : typeof id === 'number'
        ? `load${id}`
        : `${id}`;

    const body = targetState !== null ? JSON.stringify({ state: targetState }) : undefined;
    const method = 'POST';

    const data = await this._request(`/load/${target}`, {
      method,
      body,
    });
    return data.state === true;
  }

  async batchSetLoads({ load1, load2, supply, battSupply, charger }) {
    const body = {};
    if (load1 !== undefined) body.load1 = load1;
    if (load2 !== undefined) body.load2 = load2;
    if (supply !== undefined) {
      body.supply = supply;
      body.source = supply;
    }
    if (battSupply !== undefined) body.battSupply = battSupply;
    if (charger !== undefined) body.charger = charger;

    return await this._request('/loads/set', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async fetchSettings() {
    try {
      const data = await this._request('/api/settings');
      return {
        lowBatteryThreshold: parseNum(data.lowBatteryThreshold, 20),
        criticalThreshold: parseNum(data.criticalThreshold, 10),
        priorityLoad: String(data.priorityLoad || 'load1'),
      };
    } catch {
      return {
        lowBatteryThreshold: 20,
        criticalThreshold: 10,
        priorityLoad: 'load1',
      };
    }
  }

  async upsertSettings(settings) {
    return await this._request('/api/settings', {
      method: 'POST',
      body: JSON.stringify({
        lowBatteryThreshold: settings.lowBatteryThreshold,
        criticalThreshold: settings.criticalThreshold,
        priorityLoad: settings.priorityLoad,
      }),
    });
  }

  async updateEnvironment({ temperature, humidity, distance, battery, inputVoltage, current = 0.0 }) {
    return await this._request('/data', {
      method: 'POST',
      body: JSON.stringify({
        temperature,
        humidity,
        distance,
        battery,
        inputVoltage,
        current,
      }),
    });
  }
}

export const primaryApi = new ApiService(PRIMARY_API);
export const fallbackApi = new ApiService(FALLBACK_API);

export async function safeApiCall(fn) {
  try {
    return await fn(primaryApi);
  } catch {
    return await fn(fallbackApi);
  }
}
