import { useState, useEffect, useCallback, useMemo } from 'react';
import { level1Lessons } from '../content/lessons/level1';
import { level2Lessons } from '../content/lessons/level2';

// Achievement definitions
export interface Achievement {
  id: string;
  title: { en: string; cn: string };
  description: { en: string; cn: string };
  icon: string;
  unlockedAt?: number; // timestamp
}

export interface ProgressStats {
  lessonsCompleted: number;
  totalLessons: number;
  lessonsPercent: number;
  exercisesCompleted: number;
  totalExercises: number;
  exercisesPercent: number;
  overallPercent: number;
  level1Completed: boolean;
  level2Completed: boolean;
  level1Progress: number;
  level2Progress: number;
  achievements: Achievement[];
  streak: number;
  lastActiveDate: string | null;
}

const STORAGE_KEYS = {
  completedLessons: 'academy-completed-lessons',
  completedExercises: 'academy-completed-exercises',
  achievements: 'academy-achievements',
  lastActiveDate: 'academy-last-active',
  streak: 'academy-streak',
};

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_lesson',
    title: { en: 'First Steps', cn: '初学入门' },
    description: { en: 'Complete your first lesson', cn: '完成第一节课程' },
    icon: '🎯',
  },
  {
    id: 'level1_complete',
    title: { en: 'Foundation Builder', cn: '基础奠基者' },
    description: { en: 'Complete all Level 1 lessons', cn: '完成所有第一级课程' },
    icon: '🏗️',
  },
  {
    id: 'level2_complete',
    title: { en: 'Action Master', cn: 'Action 大师' },
    description: { en: 'Complete all Level 2 lessons', cn: '完成所有第二级课程' },
    icon: '⚡',
  },
  {
    id: 'first_exercise',
    title: { en: 'Practice Makes Perfect', cn: '熟能生巧' },
    description: { en: 'Complete your first exercise', cn: '完成第一个练习' },
    icon: '💪',
  },
  {
    id: 'perfect_score',
    title: { en: 'Perfectionist', cn: '完美主义者' },
    description: { en: 'Score 100% on any exercise', cn: '在任意练习中获得满分' },
    icon: '🌟',
  },
  {
    id: 'all_exercises',
    title: { en: 'Practice Champion', cn: '练习冠军' },
    description: { en: 'Complete all available exercises', cn: '完成所有可用练习' },
    icon: '🏆',
  },
  {
    id: 'streak_3',
    title: { en: 'Consistent Learner', cn: '持续学习者' },
    description: { en: 'Learn for 3 days in a row', cn: '连续学习 3 天' },
    icon: '🔥',
  },
  {
    id: 'streak_7',
    title: { en: 'Week Warrior', cn: '周学习战士' },
    description: { en: 'Learn for 7 days in a row', cn: '连续学习 7 天' },
    icon: '🗓️',
  },
];

const TOTAL_EXERCISES = 2; // noun-verb and action-design

export function useProgress() {
  // State
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.completedLessons);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [completedExercises, setCompletedExercises] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.completedExercises);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.achievements);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.streak);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lastActiveDate, setLastActiveDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.lastActiveDate);
    } catch {
      return null;
    }
  });

  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify([...completedLessons]));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.completedExercises, JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.streak, String(streak));
  }, [streak]);

  useEffect(() => {
    if (lastActiveDate) {
      localStorage.setItem(STORAGE_KEYS.lastActiveDate, lastActiveDate);
    }
  }, [lastActiveDate]);

  // Check and update streak
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    if (lastActiveDate === today) {
      return; // Already active today
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastActiveDate === yesterday) {
      // Continue streak
      setStreak(prev => prev + 1);
    } else if (lastActiveDate !== today) {
      // Break streak (unless first time)
      setStreak(lastActiveDate ? 1 : 1);
    }

    setLastActiveDate(today);
  }, [lastActiveDate]);

  // Unlock achievement helper
  const unlockAchievement = useCallback((achievementId: string) => {
    if (achievements.some(a => a.id === achievementId)) {
      return; // Already unlocked
    }

    const definition = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
    if (!definition) return;

    const newAch: Achievement = {
      ...definition,
      unlockedAt: Date.now(),
    };

    setAchievements(prev => [...prev, newAch]);
    setNewAchievement(newAch);

    // Auto-dismiss after 3 seconds
    setTimeout(() => setNewAchievement(null), 3000);
  }, [achievements]);

  // Check achievements
  const checkAchievements = useCallback(() => {
    // First lesson
    if (completedLessons.size >= 1) {
      unlockAchievement('first_lesson');
    }

    // Level 1 complete
    if (level1Lessons.every(l => completedLessons.has(l.id))) {
      unlockAchievement('level1_complete');
    }

    // Level 2 complete
    if (level2Lessons.every(l => completedLessons.has(l.id))) {
      unlockAchievement('level2_complete');
    }

    // First exercise
    if (Object.keys(completedExercises).length >= 1) {
      unlockAchievement('first_exercise');
    }

    // Perfect score
    if (Object.values(completedExercises).some(score => score === 100)) {
      unlockAchievement('perfect_score');
    }

    // All exercises
    if (Object.keys(completedExercises).length >= TOTAL_EXERCISES) {
      unlockAchievement('all_exercises');
    }

    // Streak achievements
    if (streak >= 3) {
      unlockAchievement('streak_3');
    }
    if (streak >= 7) {
      unlockAchievement('streak_7');
    }
  }, [completedLessons, completedExercises, streak, unlockAchievement]);

  // Run achievement check when data changes
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Actions
  const completeLesson = useCallback((lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    updateStreak();
  }, [updateStreak]);

  const completeExercise = useCallback((exerciseId: string, score: number) => {
    setCompletedExercises(prev => ({ ...prev, [exerciseId]: score }));
    updateStreak();
  }, [updateStreak]);

  const isLessonCompleted = useCallback((lessonId: string) => {
    return completedLessons.has(lessonId);
  }, [completedLessons]);

  const getExerciseScore = useCallback((exerciseId: string) => {
    return completedExercises[exerciseId];
  }, [completedExercises]);

  const dismissAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  // Computed stats
  const stats: ProgressStats = useMemo(() => {
    const totalLessons = level1Lessons.length + level2Lessons.length;
    const lessonsCompleted = completedLessons.size;
    const exercisesCompleted = Object.keys(completedExercises).length;

    const level1Done = level1Lessons.filter(l => completedLessons.has(l.id)).length;
    const level2Done = level2Lessons.filter(l => completedLessons.has(l.id)).length;

    const lessonsPercent = Math.round((lessonsCompleted / totalLessons) * 100);
    const exercisesPercent = Math.round((exercisesCompleted / TOTAL_EXERCISES) * 100);
    const overallPercent = Math.round(((lessonsCompleted + exercisesCompleted) / (totalLessons + TOTAL_EXERCISES)) * 100);

    return {
      lessonsCompleted,
      totalLessons,
      lessonsPercent,
      exercisesCompleted,
      totalExercises: TOTAL_EXERCISES,
      exercisesPercent,
      overallPercent,
      level1Completed: level1Done === level1Lessons.length,
      level2Completed: level2Done === level2Lessons.length,
      level1Progress: Math.round((level1Done / level1Lessons.length) * 100),
      level2Progress: Math.round((level2Done / level2Lessons.length) * 100),
      achievements,
      streak,
      lastActiveDate,
    };
  }, [completedLessons, completedExercises, achievements, streak, lastActiveDate]);

  return {
    // State
    completedLessons,
    completedExercises,
    stats,
    newAchievement,

    // Actions
    completeLesson,
    completeExercise,
    isLessonCompleted,
    getExerciseScore,
    dismissAchievement,

    // Achievement definitions (for display)
    allAchievements: ACHIEVEMENT_DEFINITIONS,
  };
}
