export const timeSlotOptions = [
  { value: 'morning', label: '오전' },
  { value: 'afternoon', label: '오후' },
  { value: 'evening', label: '저녁' }
]

export const MAX_GOODS_ITEMS = 5

export const priorityOptions = [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '낮음' }
]

const priorityRank = {
  high: 0,
  medium: 1,
  low: 2
}

const timeSlotLabels = {
  morning: '오전',
  afternoon: '오후',
  evening: '저녁'
}

export function getVisitDateLabel(visitDate) {
  return visitDate || '날짜 미정'
}

export function formatTimeSlot(timeSlot) {
  return timeSlotLabels[timeSlot] || '시간대 미정'
}

export function hasWaitMinutesError(waitMinutes) {
  if (waitMinutes === '') {
    return false
  }

  return Number(waitMinutes) < 0
}

export function getWaitMinutesLabel(waitMinutes) {
  if (waitMinutes === '') {
    return '대기 시간 미정'
  }

  if (hasWaitMinutesError(waitMinutes)) {
    return '대기 시간 확인 필요'
  }

  return `${Number(waitMinutes)}분 예상`
}

export function getWaitMessage(waitMinutes) {
  const minutes = Number(waitMinutes || 0)

  if (minutes >= 120) {
    return '긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.'
  }

  if (minutes >= 60) {
    return '대기가 조금 길 수 있어요. 물과 배터리를 챙겨요.'
  }

  return '가볍게 다녀오기 좋은 플랜이에요.'
}

export function canAddGoodsItem(goodsItems) {
  return goodsItems.length < MAX_GOODS_ITEMS
}

export function createGoodsItem(name, id) {
  return {
    id,
    name: name.trim(),
    priority: 'medium',
    budget: ''
  }
}

export function parseGoodsBudget(budget) {
  if (budget === '') {
    return 0
  }

  return Number(budget)
}

export function hasGoodsBudgetError(budget) {
  if (budget === '') {
    return false
  }

  return Number(budget) < 0
}

export function getGoodsBudgetTotal(goodsItems) {
  return goodsItems.reduce((total, item) => total + parseGoodsBudget(item.budget), 0)
}

export function getPriorityGoodsForCard(goodsItems) {
  return goodsItems
    .map((item, originalIndex) => ({
      ...item,
      name: item.name.trim(),
      originalIndex
    }))
    .filter((item) => item.name)
    .sort((left, right) => {
      const leftRank = priorityRank[left.priority] ?? 3
      const rightRank = priorityRank[right.priority] ?? 3
      const priorityDifference = leftRank - rightRank

      return priorityDifference || left.originalIndex - right.originalIndex
    })
    .slice(0, 3)
    .map(({ originalIndex, ...item }) => item)
}

export function getChecklistProgress(checklistItems) {
  const checkedCount = checklistItems.filter((item) => item.checked).length
  const totalCount = checklistItems.length

  return {
    checkedCount,
    totalCount,
    label: `${checkedCount}/${totalCount} 준비됨`
  }
}

export function getChecklistReadyMessage(checklistItems) {
  const { checkedCount, totalCount } = getChecklistProgress(checklistItems)

  if (totalCount > 0 && checkedCount === totalCount) {
    return '준비 완료! 현장에서 바로 확인하면 돼요.'
  }

  return '아직 준비할 항목이 남아 있어요.'
}
