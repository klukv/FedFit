import "./SurveyPlanGenerating.css";

/** Состояние загрузки при формировании плана. */
const SurveyPlanGenerating = () => (
  <div className="plan-generating" role="status" aria-live="polite">
    <span className="plan-generating__spinner" aria-hidden />
    <p className="plan-generating__title">Формируем ваш план</p>
    <p className="plan-generating__text">
      Подбираем тренировки по вашим ответам — это займёт несколько секунд
    </p>
  </div>
);

export default SurveyPlanGenerating;
