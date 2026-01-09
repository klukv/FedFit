"use client";

import React from "react";
import { Montserrat } from "next/font/google";
import clsx from "clsx";
import { Exercise } from "../../types";
import ExerciseItem from "./ExerciseItem";
import "./exerciseList.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
});

interface ExerciseListProps {
  exercises: Exercise[];
}

const ExerciseList = ({ exercises }: ExerciseListProps) => {
  return (
    <section
      className="exercise-list"
      role="region"
      aria-label="Список упражнений"
    >
      <h2 className={clsx("exercise-list__title", montserrat.className)}>
        Упражнения
      </h2>
      <div className="exercise-list__items" role="list">
        {exercises.map((exercise, index) => (
          <ExerciseItem key={exercise.id} exercise={exercise} index={index} />
        ))}
      </div>
    </section>
  );
};

export default ExerciseList;

