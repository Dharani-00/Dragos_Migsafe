// Shared data model for workers - used by both admin and esevai portals
export interface Worker {
  id: string
  name: string
  uniqueId: string
  biometricData: {
    fingerprint: string | null
    facialScan: string | null
    verified: boolean
  }
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// Storage keys
const WORKERS_STORAGE_KEY = 'migsafe_workers'

// Get all workers
export function getWorkers(): Worker[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(WORKERS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading workers from storage:', error)
    return []
  }
}

// Save all workers
export function saveWorkers(workers: Worker[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(workers))
  } catch (error) {
    console.error('Error saving workers to storage:', error)
  }
}

// Add a new worker
export function addWorker(worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Worker {
  const newWorker: Worker = {
    ...worker,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const workers = getWorkers()
  workers.push(newWorker)
  saveWorkers(workers)

  return newWorker
}

// Update a worker
export function updateWorker(id: string, updates: Partial<Worker>): Worker | null {
  const workers = getWorkers()
  const index = workers.findIndex(w => w.id === id)

  if (index === -1) return null

  workers[index] = {
    ...workers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveWorkers(workers)
  return workers[index]
}

// Find worker by unique ID
export function findWorkerByUniqueId(uniqueId: string): Worker | null {
  const workers = getWorkers()
  return workers.find(w => w.uniqueId === uniqueId) || null
}

// Generate unique ID for worker
export function generateUniqueId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `MIG${timestamp}${random}`
}