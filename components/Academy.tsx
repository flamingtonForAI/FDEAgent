import React, { useState } from 'react';
import { Language } from '../types';
import {
  GraduationCap, BookOpen, Zap, Code, Brain,
  ChevronRight, Lock, CheckCircle, Play, Clock, Target, FlaskConical,
  Award, Flame, FolderOpen, Factory, ShoppingCart, Truck
} from 'lucide-react';
import LessonViewer from './LessonViewer';
import Exercise from './Exercise';
import AchievementPopup from './AchievementPopup';
import CaseBrowser from './CaseBrowser';
import { level1Lessons, LessonContent } from '../content/lessons/level1';
import { level2Lessons } from '../content/lessons/level2';
import { useProgress } from '../hooks/useProgress';

interface Props {
  lang: Language;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Level {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lessons: Lesson[];
  unlocked: boolean;
}

// Exercise definitions
interface ExerciseInfo {
  id: string;
  type: 'noun-verb' | 'action-design';
  title: { en: string; cn: string };
  description: { en: string; cn: string };
  levelRequired: number;
}

const exercises: ExerciseInfo[] = [
  {
    id: 'ex_nv_1',
    type: 'noun-verb',
    title: { en: 'Noun-Verb Extraction', cn: 'Noun-Verb 提取' },
    description: { en: 'Identify Objects and Actions from business scenarios', cn: '从业务场景中识别对象和动作' },
    levelRequired: 1
  },
  {
    id: 'ex_ad_1',
    type: 'action-design',
    title: { en: 'Action Design', cn: 'Action 设计' },
    description: { en: 'Complete Action definitions with preconditions and postconditions', cn: '完成包含前置条件和后置状态的 Action 定义' },
    levelRequired: 2
  }
];

const translations = {
  en: {
    title: "Learning Center",
    subtitle: "Master the Ontology methodology step by step",
    progress: "Overall Progress",
    startLearning: "Start Learning",
    continueLearning: "Continue Learning",
    completed: "Completed",
    locked: "Complete previous level to unlock",
    lessons: "lessons",
    minutes: "min",
    // Practice Lab
    practiceLab: "Practice Lab",
    practiceDesc: "Apply what you've learned",
    startExercise: "Start",
    exerciseLocked: "Complete Level {level} to unlock",
    // Achievements
    achievements: "Achievements",
    achievementsDesc: "Your learning milestones",
    noAchievements: "Complete lessons to unlock achievements",
    unlockedOn: "Unlocked",
    // Streak
    streak: "day streak",
    // Case Library
    caseLibrary: "Case Library",
    caseLibraryDesc: "Learn from real-world Ontology designs",
    viewAllCases: "View All Cases",
    caseCount: "cases",
    // Levels
    level1Title: "Fundamentals",
    level1Desc: "Core concepts of Ontology and key differences from Knowledge Graph",
    level2Title: "Action Mastery",
    level2Desc: "Deep dive into Action's triple identity and state machine design",
    level3Title: "Implementation",
    level3Desc: "Transform Actions into APIs and Agent Tools",
    level4Title: "Best Practices",
    level4Desc: "Real-world cases and design patterns",
    // Level 1 lessons
    l1_1: "What is Ontology (vs Knowledge Graph)",
    l1_2: "3-Layer Architecture + AI Overlay",
    l1_3: "Noun-Verb Framework",
    l1_4: "Decision-First Principle",
    // Level 2 lessons
    l2_1: "Action's Triple Identity",
    l2_2: "State Machine Design",
    l2_3: "Action to API Mapping",
    l2_4: "Action to Agent Tool Mapping",
    // Level 3 lessons
    l3_1: "REST API Generation",
    l3_2: "OpenAPI Specification",
    l3_3: "Agent Tool Definition",
    l3_4: "Governance & Permissions",
    // Level 4 lessons
    l4_1: "Manufacturing Case Study",
    l4_2: "Retail Case Study",
    l4_3: "Logistics Case Study",
    l4_4: "Design Patterns & Anti-patterns",
  },
  cn: {
    title: "学习中心",
    subtitle: "循序渐进掌握本体方法论",
    progress: "学习进度",
    startLearning: "开始学习",
    continueLearning: "继续学习",
    completed: "已完成",
    locked: "完成上一级别解锁",
    lessons: "课时",
    minutes: "分钟",
    // Practice Lab
    practiceLab: "实战练习",
    practiceDesc: "应用所学知识",
    startExercise: "开始",
    exerciseLocked: "完成第 {level} 级解锁",
    // Achievements
    achievements: "成就",
    achievementsDesc: "你的学习里程碑",
    noAchievements: "完成课程解锁成就",
    unlockedOn: "解锁于",
    // Streak
    streak: "天连续学习",
    // Case Library
    caseLibrary: "案例库",
    caseLibraryDesc: "从真实 Ontology 设计中学习",
    viewAllCases: "查看所有案例",
    caseCount: "个案例",
    // Levels
    level1Title: "基础认知",
    level1Desc: "本体核心概念，与知识图谱的关键区别",
    level2Title: "Action 深度",
    level2Desc: "深入理解 Action 的三重身份与状态机设计",
    level3Title: "落地实现",
    level3Desc: "将 Action 转换为 API 和 Agent Tool",
    level4Title: "最佳实践",
    level4Desc: "真实案例与设计模式",
    // Level 1 lessons
    l1_1: "什么是 Ontology（vs 知识图谱）",
    l1_2: "三层架构 + AI 能力叠加",
    l1_3: "Noun-Verb 提取框架",
    l1_4: "Decision-First 原则",
    // Level 2 lessons
    l2_1: "Action 的三重身份",
    l2_2: "状态机设计",
    l2_3: "Action 到 API 的映射",
    l2_4: "Action 到 Agent Tool 的映射",
    // Level 3 lessons
    l3_1: "REST API 生成",
    l3_2: "OpenAPI 规范",
    l3_3: "Agent Tool 定义",
    l3_4: "治理与权限控制",
    // Level 4 lessons
    l4_1: "制造业案例分析",
    l4_2: "零售业案例分析",
    l4_3: "物流业案例分析",
    l4_4: "设计模式与反模式",
  }
};

const Academy: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);
  const [currentLesson, setCurrentLesson] = useState<LessonContent | null>(null);
  const [currentExercise, setCurrentExercise] = useState<ExerciseInfo | null>(null);
  const [showCaseBrowser, setShowCaseBrowser] = useState(false);

  // Use centralized progress management
  const {
    completedLessons,
    completedExercises,
    stats,
    newAchievement,
    completeLesson,
    completeExercise,
    dismissAchievement,
    allAchievements,
  } = useProgress();

  const handleLessonComplete = (lessonId: string) => {
    completeLesson(lessonId);
  };

  const handleExerciseComplete = (exerciseId: string, score: number) => {
    completeExercise(exerciseId, score);
    setCurrentExercise(null);
  };

  const handleStartLesson = (lessonId: string) => {
    // Search in both level1 and level2 lessons
    const lesson = level1Lessons.find(l => l.id === lessonId)
      || level2Lessons.find(l => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
    }
  };

  // Check if exercise is unlocked based on level requirement
  const isExerciseUnlocked = (exercise: ExerciseInfo) => {
    if (exercise.levelRequired === 1) return stats.level1Completed;
    if (exercise.levelRequired === 2) return stats.level2Completed;
    return false;
  };

  // 如果正在查看案例库，显示案例浏览器
  if (showCaseBrowser) {
    return (
      <CaseBrowser
        lang={lang}
        onClose={() => setShowCaseBrowser(false)}
      />
    );
  }

  // 如果正在做练习，显示练习界面
  if (currentExercise) {
    return (
      <Exercise
        lang={lang}
        exerciseType={currentExercise.type}
        exerciseId={currentExercise.id}
        onBack={() => setCurrentExercise(null)}
        onComplete={handleExerciseComplete}
      />
    );
  }

  // 如果正在查看课程，显示课程查看器
  if (currentLesson) {
    return (
      <LessonViewer
        lang={lang}
        lesson={currentLesson}
        onBack={() => setCurrentLesson(null)}
        onComplete={handleLessonComplete}
        isCompleted={completedLessons.has(currentLesson.id)}
      />
    );
  }

  const levels: Level[] = [
    {
      id: 1,
      title: t.level1Title,
      description: t.level1Desc,
      icon: <BookOpen size={20} />,
      color: 'cyan',
      unlocked: true,
      lessons: [
        { id: 'l1_1', title: t.l1_1, duration: '8', completed: completedLessons.has('l1_1') },
        { id: 'l1_2', title: t.l1_2, duration: '12', completed: completedLessons.has('l1_2') },
        { id: 'l1_3', title: t.l1_3, duration: '10', completed: completedLessons.has('l1_3') },
        { id: 'l1_4', title: t.l1_4, duration: '8', completed: completedLessons.has('l1_4') },
      ]
    },
    {
      id: 2,
      title: t.level2Title,
      description: t.level2Desc,
      icon: <Zap size={20} />,
      color: 'emerald',
      unlocked: stats.level1Completed,
      lessons: [
        { id: 'l2_1', title: t.l2_1, duration: '15', completed: completedLessons.has('l2_1') },
        { id: 'l2_2', title: t.l2_2, duration: '12', completed: completedLessons.has('l2_2') },
        { id: 'l2_3', title: t.l2_3, duration: '10', completed: completedLessons.has('l2_3') },
        { id: 'l2_4', title: t.l2_4, duration: '10', completed: completedLessons.has('l2_4') },
      ]
    },
    {
      id: 3,
      title: t.level3Title,
      description: t.level3Desc,
      icon: <Code size={20} />,
      color: 'purple',
      unlocked: false,
      lessons: [
        { id: 'l3_1', title: t.l3_1, duration: '15', completed: completedLessons.has('l3_1') },
        { id: 'l3_2', title: t.l3_2, duration: '12', completed: completedLessons.has('l3_2') },
        { id: 'l3_3', title: t.l3_3, duration: '12', completed: completedLessons.has('l3_3') },
        { id: 'l3_4', title: t.l3_4, duration: '10', completed: completedLessons.has('l3_4') },
      ]
    },
    {
      id: 4,
      title: t.level4Title,
      description: t.level4Desc,
      icon: <Brain size={20} />,
      color: 'orange',
      unlocked: false,
      lessons: [
        { id: 'l4_1', title: t.l4_1, duration: '20', completed: completedLessons.has('l4_1') },
        { id: 'l4_2', title: t.l4_2, duration: '20', completed: completedLessons.has('l4_2') },
        { id: 'l4_3', title: t.l4_3, duration: '20', completed: completedLessons.has('l4_3') },
        { id: 'l4_4', title: t.l4_4, duration: '15', completed: completedLessons.has('l4_4') },
      ]
    }
  ];

  const getColorClasses = (color: string, unlocked: boolean) => {
    if (!unlocked) return 'text-gray-500 bg-gray-500/5 border-gray-500/10';

    const colorMap: Record<string, string> = {
      cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
    return colorMap[color] || colorMap.cyan;
  };

  return (
    <div className="p-6 h-full bg-[#0a0a0a] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 flex items-center justify-center">
            <GraduationCap size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-white">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>

        {/* Progress & Streak */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          {stats.streak > 0 && (
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              <span className="text-orange-400 font-medium">{stats.streak}</span>
              <span className="text-xs text-gray-500">{t.streak}</span>
            </div>
          )}

          {/* Progress */}
          <div className="glass-card rounded-xl px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">{t.progress}</div>
                <div className="text-lg font-medium text-gradient">{stats.overallPercent}%</div>
              </div>
              <div className="w-24 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.overallPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="space-y-4">
        {levels.map((level, idx) => {
          const isExpanded = expandedLevel === level.id;
          const completedInLevel = level.lessons.filter(l => l.completed).length;
          const totalInLevel = level.lessons.length;
          const levelProgress = Math.round((completedInLevel / totalInLevel) * 100);

          return (
            <div
              key={level.id}
              className={`glass-card rounded-xl overflow-hidden transition-all ${
                level.unlocked ? '' : 'opacity-60'
              }`}
            >
              {/* Level Header */}
              <button
                onClick={() => level.unlocked && setExpandedLevel(isExpanded ? null : level.id)}
                disabled={!level.unlocked}
                className={`w-full p-5 flex items-center gap-4 text-left transition-colors ${
                  level.unlocked ? 'hover:bg-white/[0.02]' : 'cursor-not-allowed'
                }`}
              >
                {/* Level Icon */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getColorClasses(level.color, level.unlocked)}`}>
                  {level.unlocked ? level.icon : <Lock size={20} />}
                </div>

                {/* Level Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Level {level.id}</span>
                    {completedInLevel === totalInLevel && level.unlocked && (
                      <span className="flex items-center gap-1 text-micro text-emerald-400">
                        <CheckCircle size={10} />
                        {t.completed}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-medium ${level.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {level.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{level.description}</p>
                </div>

                {/* Level Progress */}
                <div className="flex items-center gap-4">
                  {level.unlocked ? (
                    <>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {completedInLevel}/{totalInLevel} {t.lessons}
                        </div>
                        <div className="w-20 h-1.5 bg-white/[0.06] rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              level.color === 'cyan' ? 'bg-cyan-500' :
                              level.color === 'emerald' ? 'bg-emerald-500' :
                              level.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${levelProgress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">{t.locked}</span>
                  )}
                </div>
              </button>

              {/* Lessons List */}
              {isExpanded && level.unlocked && (
                <div className="border-t border-white/[0.06] p-4 space-y-2 animate-fadeIn">
                  {level.lessons.map((lesson, lessonIdx) => {
                    const isLessonCompleted = completedLessons.has(lesson.id);
                    const hasContent = level.id === 1 || level.id === 2; // Level 1 and 2 have content

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => hasContent && handleStartLesson(lesson.id)}
                        disabled={!hasContent}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group ${
                          hasContent ? 'hover:bg-white/[0.04]' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Lesson Number/Status */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                          isLessonCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/[0.04] text-gray-500 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'
                        }`}>
                          {isLessonCompleted ? <CheckCircle size={14} /> : lessonIdx + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {lesson.title}
                          </h4>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {lesson.duration} {t.minutes}
                        </div>

                        {/* Play Button */}
                        {hasContent && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={16} className="text-cyan-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Start/Continue Button */}
                  {(level.id === 1 || level.id === 2) && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          // Find first incomplete lesson or first lesson
                          const nextLesson = level.lessons.find(l => !completedLessons.has(l.id)) || level.lessons[0];
                          handleStartLesson(nextLesson.id);
                        }}
                        className="w-full btn-gradient py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Play size={16} />
                        {completedInLevel > 0 ? t.continueLearning : t.startLearning}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Connection Line */}
              {idx < levels.length - 1 && (
                <div className="absolute left-[2.25rem] -bottom-4 w-0.5 h-4 bg-white/[0.06]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Practice Lab Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
            <FlaskConical size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">{t.practiceLab}</h2>
            <p className="text-xs text-gray-500">{t.practiceDesc}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {exercises.map(exercise => {
            const unlocked = isExerciseUnlocked(exercise);
            const score = completedExercises[exercise.id];
            const hasScore = score !== undefined;

            return (
              <div
                key={exercise.id}
                className={`glass-card rounded-xl p-5 transition-all ${
                  unlocked ? 'hover:border-purple-500/30' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                    unlocked
                      ? exercise.type === 'noun-verb'
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      : 'bg-gray-500/5 border-gray-500/10 text-gray-500'
                  }`}>
                    {unlocked ? <Target size={18} /> : <Lock size={18} />}
                  </div>
                  {hasScore && (
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">{score}%</span>
                    </div>
                  )}
                </div>

                <h3 className={`font-medium mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {exercise.title[lang]}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {exercise.description[lang]}
                </p>

                {unlocked ? (
                  <button
                    onClick={() => setCurrentExercise(exercise)}
                    className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      exercise.type === 'noun-verb'
                        ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                        : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                    }`}
                  >
                    <Play size={14} />
                    {hasScore ? t.continueLearning : t.startExercise}
                  </button>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-2">
                    {t.exerciseLocked.replace('{level}', String(exercise.levelRequired))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Library Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
              <FolderOpen size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">{t.caseLibrary}</h2>
              <p className="text-xs text-gray-500">{t.caseLibraryDesc}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCaseBrowser(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
          >
            {t.viewAllCases}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Case Preview Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <CasePreviewCard
            icon={<Factory size={18} />}
            color="blue"
            title={lang === 'cn' ? '智能生产计划' : 'Smart Production'}
            industry={lang === 'cn' ? '制造业' : 'Manufacturing'}
            objects={4}
            actions={10}
            onClick={() => setShowCaseBrowser(true)}
          />
          <CasePreviewCard
            icon={<ShoppingCart size={18} />}
            color="emerald"
            title={lang === 'cn' ? '智能库存管理' : 'Smart Inventory'}
            industry={lang === 'cn' ? '零售业' : 'Retail'}
            objects={4}
            actions={10}
            onClick={() => setShowCaseBrowser(true)}
          />
          <CasePreviewCard
            icon={<Truck size={18} />}
            color="amber"
            title={lang === 'cn' ? '智能配送调度' : 'Smart Delivery'}
            industry={lang === 'cn' ? '物流业' : 'Logistics'}
            objects={4}
            actions={12}
            onClick={() => setShowCaseBrowser(true)}
          />
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center">
            <Award size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">{t.achievements}</h2>
            <p className="text-xs text-gray-500">{t.achievementsDesc}</p>
          </div>
        </div>

        {stats.achievements.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.achievements.map(achievement => (
              <div
                key={achievement.id}
                className="glass-card rounded-xl p-4 text-center border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h4 className="text-sm font-medium text-white mb-1">
                  {achievement.title[lang]}
                </h4>
                <p className="text-micro text-gray-500">
                  {achievement.description[lang]}
                </p>
              </div>
            ))}

            {/* Locked achievements preview */}
            {allAchievements
              .filter(a => !stats.achievements.some(ua => ua.id === a.id))
              .slice(0, 4 - (stats.achievements.length % 4 || 4))
              .map(achievement => (
                <div
                  key={achievement.id}
                  className="glass-card rounded-xl p-4 text-center opacity-40"
                >
                  <div className="text-2xl mb-2 grayscale">{achievement.icon}</div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">???</h4>
                  <p className="text-micro text-gray-500">
                    {lang === 'cn' ? '待解锁' : 'Locked'}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="text-3xl mb-3 opacity-40">🏆</div>
            <p className="text-sm text-gray-500">{t.noAchievements}</p>
          </div>
        )}
      </div>

      {/* Achievement Popup */}
      {newAchievement && (
        <AchievementPopup
          lang={lang}
          achievement={newAchievement}
          onDismiss={dismissAchievement}
        />
      )}
    </div>
  );
};

// Case preview card for the Academy page
const CasePreviewCard: React.FC<{
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber';
  title: string;
  industry: string;
  objects: number;
  actions: number;
  onClick: () => void;
}> = ({ icon, color, title, industry, objects, actions, onClick }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/20'
  };

  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 text-left hover:border-cyan-500/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-micro text-gray-500">{industry}</span>
      </div>
      <h3 className="text-sm font-medium text-white mb-2 group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <div className="flex items-center gap-3 text-micro text-gray-500">
        <span>{objects} Objects</span>
        <span>•</span>
        <span>{actions} Actions</span>
      </div>
    </button>
  );
};

export default Academy;
