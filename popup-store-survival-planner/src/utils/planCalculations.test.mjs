import assert from 'node:assert/strict'

import { defaultChecklistItems } from '../data/defaultChecklist.js'
import { STORAGE_KEY, createPlanForStorage, parseStoredPlan, removeStoredPlan } from './storage.js'
import {
  MAX_GOODS_ITEMS,
  canAddGoodsItem,
  createGoodsItem,
  formatTimeSlot,
  getChecklistProgress,
  getChecklistReadyMessage,
  getGoodsBudgetTotal,
  getPriorityGoodsForCard,
  getVisitDateLabel,
  getWaitMessage,
  hasWaitMinutesError,
  hasGoodsBudgetError,
  parseGoodsBudget,
  priorityOptions
} from './planCalculations.js'

assert.equal(getVisitDateLabel(''), '날짜 미정')
assert.equal(getVisitDateLabel('2026-05-18'), '2026-05-18')

assert.equal(formatTimeSlot(''), '시간대 미정')
assert.equal(formatTimeSlot('morning'), '오전')
assert.equal(formatTimeSlot('afternoon'), '오후')
assert.equal(formatTimeSlot('evening'), '저녁')

assert.equal(getWaitMessage('30'), '가볍게 다녀오기 좋은 플랜이에요.')
assert.equal(getWaitMessage('90'), '대기가 조금 길 수 있어요. 물과 배터리를 챙겨요.')
assert.equal(getWaitMessage('150'), '긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.')

assert.equal(hasWaitMinutesError('-1'), true)
assert.equal(hasWaitMinutesError('0'), false)
assert.equal(hasWaitMinutesError(''), false)

assert.equal(MAX_GOODS_ITEMS, 5)
assert.deepEqual(priorityOptions, [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '낮음' }
])
assert.equal(canAddGoodsItem([]), true)
assert.equal(canAddGoodsItem(Array.from({ length: MAX_GOODS_ITEMS })), false)
assert.deepEqual(createGoodsItem('  키링  ', 'goods-1'), {
  id: 'goods-1',
  name: '키링',
  priority: 'medium',
  budget: ''
})

assert.equal(parseGoodsBudget(''), 0)
assert.equal(parseGoodsBudget('12000'), 12000)
assert.equal(hasGoodsBudgetError(''), false)
assert.equal(hasGoodsBudgetError('0'), false)
assert.equal(hasGoodsBudgetError('-1'), true)
assert.equal(
  getGoodsBudgetTotal([
    { budget: '12000' },
    { budget: '30000' }
  ]),
  42000
)
assert.equal(
  getGoodsBudgetTotal([
    { budget: '' },
    { budget: '30000' }
  ]),
  30000
)

assert.deepEqual(
  getPriorityGoodsForCard([
    { name: '포스터', priority: 'low', budget: '' },
    { name: '키링', priority: 'high', budget: '' },
    { name: '티셔츠', priority: 'medium', budget: '' }
  ]).map((item) => item.name),
  ['키링', '티셔츠', '포스터']
)
assert.deepEqual(
  getPriorityGoodsForCard([
    { name: '   ', priority: 'high', budget: '' },
    { name: '앨범', priority: 'medium', budget: '' }
  ]).map((item) => item.name),
  ['앨범']
)
assert.deepEqual(
  getPriorityGoodsForCard([
    { name: 'A', priority: 'high', budget: '' },
    { name: 'B', priority: 'high', budget: '' },
    { name: 'C', priority: 'medium', budget: '' },
    { name: 'D', priority: 'low', budget: '' }
  ]).map((item) => item.name),
  ['A', 'B', 'C']
)

assert.deepEqual(
  defaultChecklistItems.map((item) => item.label),
  ['보조 배터리', '물', '입장 정보 확인', '카드/현금 준비 확인', '굿즈 보관 가방']
)
assert.equal(new Set(defaultChecklistItems.map((item) => item.id)).size, defaultChecklistItems.length)

const partialChecklist = [
  { checked: true },
  { checked: true },
  { checked: true },
  { checked: false },
  { checked: false }
]
const completeChecklist = defaultChecklistItems.map((item) => ({ ...item, checked: true }))
assert.deepEqual(getChecklistProgress(partialChecklist), {
  checkedCount: 3,
  totalCount: 5,
  label: '3/5 준비됨'
})
assert.equal(getChecklistReadyMessage(partialChecklist), '아직 준비할 항목이 남아 있어요.')
assert.equal(getChecklistReadyMessage(completeChecklist), '준비 완료! 현장에서 바로 확인하면 돼요.')

const rawPlan = createPlanForStorage({
  visitDate: '2026-05-18',
  timeSlot: 'afternoon',
  waitMinutes: '90',
  goodsItems: [{ id: 'goods-1', name: '키링', priority: 'high', budget: '12000' }],
  checklistItems: [{ id: 'water', label: '물', checked: true }],
  goodsBudgetTotal: 12000,
  checklistProgress: { label: '1/1 준비됨' },
  waitMessage: 'computed'
})
assert.equal(STORAGE_KEY, 'popupStoreSurvivalPlanner.plan.v1')
assert.deepEqual(rawPlan, {
  visitDate: '2026-05-18',
  timeSlot: 'afternoon',
  waitMinutes: '90',
  goodsItems: [{ id: 'goods-1', name: '키링', priority: 'high', budget: '12000' }],
  checklistItems: [{ id: 'water', checked: true }]
})
assert.deepEqual(parseStoredPlan(JSON.stringify(rawPlan)), rawPlan)
assert.equal(parseStoredPlan('{broken json'), null)
let removedKey = ''
removeStoredPlan({
  removeItem(key) {
    removedKey = key
  }
})
assert.equal(removedKey, STORAGE_KEY)
