package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ExerciseRepository struct {
	pool *pgxpool.Pool
}

func NewExerciseRepository(pool *pgxpool.Pool) *ExerciseRepository {
	return &ExerciseRepository{pool: pool}
}

func (r *ExerciseRepository) CreateExerciseTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS exercise (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		icon TEXT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("создание таблицы упражнений провалено: %w", err)
	}

	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS exercise_metadata (
		exercise_id INT PRIMARY KEY REFERENCES exercise(id) ON DELETE CASCADE,
		muscle_group VARCHAR(32) NOT NULL,
		equipment JSONB NOT NULL DEFAULT '["none"]',
		restrictions_excluded JSONB NOT NULL DEFAULT '[]',
		level JSONB NOT NULL DEFAULT '["beginner"]',
		calories_per_set NUMERIC(5,2) DEFAULT 10.0
	)`); err != nil {
		return fmt.Errorf("создание таблицы exercise_metadata провалено: %w", err)
	}

	return nil
}

func (r *ExerciseRepository) GetAll(ctx context.Context) ([]models.Exercise, error) {
	return r.queryExercises(ctx, exerciseListQuery, nil)
}

func (r *ExerciseRepository) GetByID(ctx context.Context, exerciseID int) (*models.Exercise, error) {
	exercises, err := r.queryExercises(ctx, exerciseByIDQuery, exerciseID)
	if err != nil {
		return nil, err
	}
	if len(exercises) == 0 {
		return nil, nil
	}
	return &exercises[0], nil
}

const exerciseListQuery = `SELECT
	e.id,
	e.name,
	e.description,
	e.icon,
	em.muscle_group,
	em.equipment,
	em.restrictions_excluded,
	em.level,
	em.calories_per_set
FROM exercise e
LEFT JOIN exercise_metadata em ON em.exercise_id = e.id
ORDER BY e.id`

const exerciseByIDQuery = `SELECT
	e.id,
	e.name,
	e.description,
	e.icon,
	em.muscle_group,
	em.equipment,
	em.restrictions_excluded,
	em.level,
	em.calories_per_set
FROM exercise e
LEFT JOIN exercise_metadata em ON em.exercise_id = e.id
WHERE e.id = $1`

func (r *ExerciseRepository) queryExercises(ctx context.Context, query string, id any) ([]models.Exercise, error) {
	var rows pgx.Rows
	var err error

	if id != nil {
		rows, err = r.pool.Query(ctx, query, id)
	} else {
		rows, err = r.pool.Query(ctx, query)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var exercises []models.Exercise
	for rows.Next() {
		ex, err := scanExercise(rows)
		if err != nil {
			return nil, err
		}
		exercises = append(exercises, ex)
	}

	return exercises, rows.Err()
}

type scannable interface {
	Scan(dest ...any) error
}

func scanExercise(row scannable) (models.Exercise, error) {
	var ex models.Exercise
	var muscleGroup *string
	var equipment, restrictions, level []byte
	var caloriesPerSet *float64

	if err := row.Scan(
		&ex.ID,
		&ex.Name,
		&ex.Description,
		&ex.Icon,
		&muscleGroup,
		&equipment,
		&restrictions,
		&level,
		&caloriesPerSet,
	); err != nil {
		return ex, err
	}

	ex.MuscleGroup = muscleGroup
	if len(equipment) > 0 {
		ex.Equipment = equipment
	}
	if len(restrictions) > 0 {
		ex.RestrictionsExcluded = restrictions
	}
	if len(level) > 0 {
		ex.Level = level
	}
	ex.CaloriesPerSet = caloriesPerSet

	return ex, nil
}

func (r *ExerciseRepository) UpsertMetadata(ctx context.Context, exerciseID int, meta *models.ExerciseMetadataInput) error {
	query := `INSERT INTO exercise_metadata (
		exercise_id, muscle_group, equipment, restrictions_excluded, level, calories_per_set
	) VALUES ($1, $2, $3, $4, $5, $6)
	ON CONFLICT (exercise_id) DO UPDATE SET
		muscle_group = EXCLUDED.muscle_group,
		equipment = EXCLUDED.equipment,
		restrictions_excluded = EXCLUDED.restrictions_excluded,
		level = EXCLUDED.level,
		calories_per_set = EXCLUDED.calories_per_set`

	_, err := r.pool.Exec(ctx, query,
		exerciseID,
		meta.MuscleGroup,
		meta.Equipment,
		meta.RestrictionsExcluded,
		meta.Level,
		meta.CaloriesPerSet,
	)
	return err
}

func (r *ExerciseRepository) DeleteMetadata(ctx context.Context, exerciseID int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM exercise_metadata WHERE exercise_id = $1`, exerciseID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

var exercisePrescriptionDefaults = map[int]models.ExercisePrescription{
	1:  {Sets: intPtr(3), Reps: intPtr(12)},
	2:  {Sets: intPtr(3), Reps: intPtr(10)},
	3:  {Sets: intPtr(2), Duration: intPtr(30)},
	4:  {Sets: intPtr(3), Reps: intPtr(12)},
	5:  {Sets: intPtr(3), Reps: intPtr(10)},
	6:  {Sets: intPtr(2), Reps: intPtr(15)},
	7:  {Sets: intPtr(3), Reps: intPtr(15)},
	8:  {Sets: intPtr(3), Reps: intPtr(20)},
	9:  {Sets: intPtr(2), Duration: intPtr(60)},
	10: {Sets: intPtr(2), Duration: intPtr(60)},
	11: {Sets: intPtr(3), Reps: intPtr(15)},
	12: {Sets: intPtr(2), Reps: intPtr(8)},
	13: {Sets: intPtr(3), Reps: intPtr(15)},
	14: {Sets: intPtr(2), Duration: intPtr(30)},
	15: {Sets: intPtr(3), Duration: intPtr(45)},
	16: {Sets: intPtr(3), Reps: intPtr(15)},
	17: {Sets: intPtr(3), Reps: intPtr(12)},
	18: {Sets: intPtr(3), Reps: intPtr(10)},
	19: {Sets: intPtr(3), Reps: intPtr(10)},
	20: {Sets: intPtr(3), Reps: intPtr(12)},
}

func intPtr(v int) *int { return &v }

func (r *ExerciseRepository) GetForCatalog(ctx context.Context) ([]models.Exercise, error) {
	exercises, err := r.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]models.Exercise, 0, len(exercises))
	for _, ex := range exercises {
		prescription := exercisePrescriptionDefaults[ex.ID]
		ex.ApplyCatalogDefaults(&prescription)
		result = append(result, ex)
	}

	return result, nil
}
