export const STORAGE_KEY = 'popupStoreSurvivalPlanner.plan.v1'

export function createPlanForStorage({
  visitDate,
  timeSlot,
  waitMinutes,
  goodsItems,
  checklistItems
}) {
  return {
    visitDate,
    timeSlot,
    waitMinutes,
    goodsItems: goodsItems.map(({ id, name, priority, budget }) => ({
      id,
      name,
      priority,
      budget
    })),
    checklistItems: checklistItems.map(({ id, checked }) => ({
      id,
      checked
    }))
  }
}

export function parseStoredPlan(value) {
  try {
    const parsedPlan = JSON.parse(value)

    if (!parsedPlan || typeof parsedPlan !== 'object') {
      return null
    }

    return {
      visitDate: parsedPlan.visitDate || '',
      timeSlot: parsedPlan.timeSlot || '',
      waitMinutes: parsedPlan.waitMinutes || '',
      goodsItems: Array.isArray(parsedPlan.goodsItems) ? parsedPlan.goodsItems : [],
      checklistItems: Array.isArray(parsedPlan.checklistItems) ? parsedPlan.checklistItems : []
    }
  } catch {
    return null
  }
}

export function readStoredPlan(storage = globalThis.localStorage) {
  if (!storage) {
    return null
  }

  return parseStoredPlan(storage.getItem(STORAGE_KEY))
}

export function writeStoredPlan(plan, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(createPlanForStorage(plan)))
}

export function removeStoredPlan(storage = globalThis.localStorage) {
  storage.removeItem(STORAGE_KEY)
}
