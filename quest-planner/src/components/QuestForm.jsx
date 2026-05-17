export default function QuestForm({
  budgetOptions,
  companionOptions,
  errors,
  moodOptions,
  onChange,
  onSubmit,
  preference,
  timeOptions,
}) {
  return (
    <form className="quest-form" onSubmit={onSubmit} noValidate>
      <ChoiceGroup
        error={errors.mood}
        field="mood"
        legend="오늘의 기분"
        onChange={onChange}
        options={moodOptions}
        value={preference.mood}
      />
      <ChoiceGroup
        error={errors.timeLimitMinutes}
        field="timeLimitMinutes"
        legend="사용 가능 시간"
        onChange={onChange}
        options={timeOptions}
        value={preference.timeLimitMinutes}
      />
      <ChoiceGroup
        error={errors.budgetLimitWon}
        field="budgetLimitWon"
        legend="예산"
        onChange={onChange}
        options={budgetOptions}
        value={preference.budgetLimitWon}
      />
      <ChoiceGroup
        error={errors.companion}
        field="companion"
        legend="동행 여부"
        onChange={onChange}
        options={companionOptions}
        value={preference.companion}
      />
      <button className="primary-button" type="submit">
        미니 코스 추천받기
      </button>
    </form>
  );
}

function ChoiceGroup({ error, field, legend, onChange, options, value }) {
  const groupId = `choice-${field}`;

  return (
    <fieldset className="choice-group" aria-describedby={error ? `${groupId}-error` : undefined}>
      <legend>{legend}</legend>
      <div className="choice-grid">
        {options.map((option) => (
          <label className="choice-option" key={option.value}>
            <input
              checked={value === option.value}
              name={field}
              onChange={() => onChange(field, option.value)}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="field-error" id={`${groupId}-error`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
