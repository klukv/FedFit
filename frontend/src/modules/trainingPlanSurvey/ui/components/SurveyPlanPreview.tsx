import type { TrainingPlan } from "@/modules/workout/types";
import type { SurveySummary } from "../../types";
import "./SurveyPlanPreview.css";

interface SurveyPlanPreviewProps {
  plan: TrainingPlan;
  summary: SurveySummary;
}

/** Предпросмотр сформированного плана тренировок. */
const SurveyPlanPreview = ({ plan, summary }: SurveyPlanPreviewProps) => (
  <article className="plan-preview" aria-label="Предпросмотр плана тренировок">
    <header className="plan-preview__hero">
      <span className="plan-preview__badge">Предпросмотр</span>
      <h3 className="plan-preview__title">{plan.name}</h3>
      <p className="plan-preview__description">{plan.description}</p>
    </header>

    <dl className="plan-preview__meta">
      <div className="plan-preview__meta-item">
        <dt>Цель и уровень</dt>
        <dd>{summary.goalLevel}</dd>
      </div>
      <div className="plan-preview__meta-item">
        <dt>Ритм</dt>
        <dd>{summary.rhythm}</dd>
      </div>
      <div className="plan-preview__meta-item">
        <dt>Тренировок</dt>
        <dd>{plan.workouts.length}</dd>
      </div>
    </dl>

    <section className="plan-preview__workouts" aria-labelledby="plan-preview-workouts-title">
      <div className="plan-preview__workouts-head">
        <h4 id="plan-preview-workouts-title" className="plan-preview__workouts-title">
          Тренировки в плане
        </h4>
        <p className="plan-preview__workouts-hint">
          Оцените состав — при необходимости можно сгенерировать новый вариант
        </p>
      </div>

      <ol className="plan-preview__list">
        {plan.workouts.map((workout, index) => (
          <li key={`${workout.id}-${index}`} className="plan-preview__card">
            <span className="plan-preview__card-day" aria-hidden>
              {index + 1}
            </span>
            <div className="plan-preview__card-body">
              <p className="plan-preview__card-name">{workout.name}</p>
              <p className="plan-preview__card-value">{workout.value}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  </article>
);

export default SurveyPlanPreview;
