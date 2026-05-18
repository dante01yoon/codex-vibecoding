import assert from 'node:assert/strict'

import {
  MAX_GOODS_ITEMS,
  canAddGoodsItem,
  createGoodsItem,
  formatTimeSlot,
  getVisitDateLabel,
  getWaitMessage,
  hasWaitMinutesError,
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
