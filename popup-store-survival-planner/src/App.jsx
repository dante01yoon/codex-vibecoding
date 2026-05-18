import { useState } from 'react'

import {
  canAddGoodsItem,
  createGoodsItem,
  formatTimeSlot,
  getVisitDateLabel,
  getWaitMessage,
  getWaitMinutesLabel,
  hasWaitMinutesError,
  priorityOptions,
  timeSlotOptions
} from './utils/planCalculations.js'

const goodsLimitNotice = '굿즈는 최대 5개까지만 추가할 수 있어요.'

function createGoodsId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `goods-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function App() {
  const [visitDate, setVisitDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [waitMinutes, setWaitMinutes] = useState('')
  const [goodsItems, setGoodsItems] = useState([])
  const [newGoodsName, setNewGoodsName] = useState('')
  const [goodsNotice, setGoodsNotice] = useState('')

  const waitMinutesError = hasWaitMinutesError(waitMinutes)

  function handleAddGoodsItem(event) {
    event.preventDefault()

    const trimmedGoodsName = newGoodsName.trim()

    if (!trimmedGoodsName) {
      return
    }

    if (!canAddGoodsItem(goodsItems)) {
      setGoodsNotice(goodsLimitNotice)
      return
    }

    const nextGoodsItem = createGoodsItem(trimmedGoodsName, createGoodsId())

    setGoodsItems((currentGoodsItems) => {
      if (!canAddGoodsItem(currentGoodsItems)) {
        return currentGoodsItems
      }

      return [...currentGoodsItems, nextGoodsItem]
    })
    setNewGoodsName('')
    setGoodsNotice('')
  }

  function updateGoodsItem(goodsId, field, value) {
    setGoodsItems((currentGoodsItems) =>
      currentGoodsItems.map((item) => (item.id === goodsId ? { ...item, [field]: value } : item))
    )
  }

  function deleteGoodsItem(goodsId) {
    setGoodsItems((currentGoodsItems) => currentGoodsItems.filter((item) => item.id !== goodsId))
    setGoodsNotice('')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">방문 전 플랜</p>
        <h1>Pop-up Store Survival Planner</h1>
        <p className="app-description">
          방문 날짜, 시간대, 예상 대기 시간을 한 장의 플랜 카드로 정리하세요.
        </p>
      </header>

      <div className="planner-layout">
        <div className="input-flow">
          <section className="section-panel" aria-labelledby="visit-info-title">
            <div className="section-heading">
              <p className="section-kicker">Step 1</p>
              <h2 id="visit-info-title">방문 정보</h2>
            </div>

            <div className="form-stack">
              <div className="form-field">
                <label htmlFor="visit-date">방문 날짜</label>
                <input
                  id="visit-date"
                  type="date"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="time-slot">방문 시간대</label>
                <select
                  id="time-slot"
                  value={timeSlot}
                  onChange={(event) => setTimeSlot(event.target.value)}
                >
                  <option value="">시간대 선택</option>
                  {timeSlotOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="wait-minutes">예상 대기 시간</label>
                <div className="number-input-row">
                  <input
                    aria-describedby={waitMinutesError ? 'wait-minutes-error' : undefined}
                    id="wait-minutes"
                    min="0"
                    type="number"
                    value={waitMinutes}
                    onChange={(event) => setWaitMinutes(event.target.value)}
                  />
                  <span aria-hidden="true">분</span>
                </div>
                {waitMinutesError ? (
                  <p className="field-error" id="wait-minutes-error">
                    0 이상의 숫자로 입력해주세요.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="section-panel" aria-labelledby="goods-section-title">
            <div className="section-heading">
              <p className="section-kicker">Step 2</p>
              <h2 id="goods-section-title">굿즈 우선순위와 예산</h2>
            </div>

            <form className="goods-add-form" onSubmit={handleAddGoodsItem}>
              <div className="form-field">
                <label htmlFor="new-goods-name">굿즈 이름</label>
                <input
                  id="new-goods-name"
                  type="text"
                  value={newGoodsName}
                  onChange={(event) => setNewGoodsName(event.target.value)}
                  placeholder="예: 키링"
                />
              </div>
              <button className="primary-button" type="submit">
                추가
              </button>
            </form>

            {goodsNotice ? (
              <p className="notice-message" role="status">
                {goodsNotice}
              </p>
            ) : null}

            {goodsItems.length === 0 ? (
              <p className="empty-state">아직 추가한 굿즈가 없어요.</p>
            ) : (
              <ul className="goods-list" aria-label="굿즈 목록">
                {goodsItems.map((item) => {
                  const nameInputId = `goods-name-${item.id}`
                  const priorityInputId = `goods-priority-${item.id}`
                  const budgetInputId = `goods-budget-${item.id}`

                  return (
                    <li className="goods-item" key={item.id}>
                      <div className="goods-item-grid">
                        <div className="form-field">
                          <label htmlFor={nameInputId}>이름</label>
                          <input
                            id={nameInputId}
                            type="text"
                            value={item.name}
                            onChange={(event) =>
                              updateGoodsItem(item.id, 'name', event.target.value)
                            }
                          />
                        </div>

                        <div className="form-field">
                          <label htmlFor={priorityInputId}>우선순위</label>
                          <select
                            id={priorityInputId}
                            value={item.priority}
                            onChange={(event) =>
                              updateGoodsItem(item.id, 'priority', event.target.value)
                            }
                          >
                            {priorityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor={budgetInputId}>예상 금액</label>
                          <input
                            id={budgetInputId}
                            min="0"
                            type="number"
                            value={item.budget}
                            onChange={(event) =>
                              updateGoodsItem(item.id, 'budget', event.target.value)
                            }
                          />
                        </div>

                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => deleteGoodsItem(item.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <section className="survival-card" aria-labelledby="survival-card-title">
          <p className="section-kicker">Today</p>
          <h2 id="survival-card-title">오늘의 생존 플랜</h2>

          <dl className="plan-summary">
            <div>
              <dt>방문 날짜</dt>
              <dd>{getVisitDateLabel(visitDate)}</dd>
            </div>
            <div>
              <dt>시간대</dt>
              <dd>{formatTimeSlot(timeSlot)}</dd>
            </div>
            <div>
              <dt>예상 대기</dt>
              <dd>{getWaitMinutesLabel(waitMinutes)}</dd>
            </div>
          </dl>

          <p className={`wait-message ${waitMinutesError ? 'is-warning' : ''}`}>
            {waitMinutesError ? '대기 시간을 다시 확인해 주세요.' : getWaitMessage(waitMinutes)}
          </p>
        </section>
      </div>
    </main>
  )
}

export default App
