import React, { useState } from 'react';
import {
  GraduationCap, BookOpen, Zap, Code, Brain,
  ChevronRight, Lock, CheckCircle, Play, Clock, Target, FlaskConical,
  Award, Flame, FolderOpen, Factory, ShoppingCart, Truck,
  Route, FileText, ClipboardCheck, BookMarked, Users, Cpu,
  ChevronDown, Star, Sparkles, Layers, Workflow
} from 'lucide-react';
import LessonViewer from './LessonViewer';
import Exercise from './Exercise';
import AchievementPopup from './AchievementPopup';
import CaseBrowser from './CaseBrowser';
import { level1Lessons, LessonContent } from '../content/lessons/level1';
import { level2Lessons } from '../content/lessons/level2';
import { methodologyLessons } from '../content/lessons/methodology';
import { aiLayerLessons } from '../content/lessons/aiLayer';
import { quickReferenceCards, checklists, interviewTemplates, glossaryTerms, learningPaths, ReferenceCard, GlossaryTerm } from '../content/reference';
import { useProgress } from '../hooks/useProgress';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Props {
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Level {
  id: number;
  key: string;
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
  type: 'noun-verb' | 'action-design' | 'interview-sim' | 'state-machine';
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
  },
  {
    id: 'ex_sm_1',
    type: 'state-machine',
    title: { en: 'State Machine Design', cn: '状态机设计' },
    description: { en: 'Design state transitions for Use Case Objects', cn: '为用例对象设计状态转换' },
    levelRequired: 2
  }
];

// Active view type
type ViewType = 'main' | 'paths' | 'reference' | 'glossary';


const Academy: React.FC<Props> = () => {
  const { t, lang, lt } = useAppTranslation('academy');
  const [expandedLevel, setExpandedLevel] = useState<string | null>('level1');
  const [currentLesson, setCurrentLesson] = useState<LessonContent | null>(null);
  const [currentExercise, setCurrentExercise] = useState<ExerciseInfo | null>(null);
  const [showCaseBrowser, setShowCaseBrowser] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('main');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

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

  // All lessons lookup
  const allLessons = [...level1Lessons, ...level2Lessons, ...methodologyLessons, ...aiLayerLessons];

  const handleStartLesson = (lessonId: string) => {
    const lesson = allLessons.find(l => l.id === lessonId);
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

  // Calculate completed count for methodology and AI lessons
  const methodologyCompleted = methodologyLessons.filter(l => completedLessons.has(l.id)).length;
  const aiLayerCompleted = aiLayerLessons.filter(l => completedLessons.has(l.id)).length;

  // 如果正在查看案例库，显示案例浏览器
  if (showCaseBrowser) {
    return (
      <CaseBrowser
        onClose={() => setShowCaseBrowser(false)}
      />
    );
  }

  // 如果正在做练习，显示练习界面
  if (currentExercise) {
    return (
      <Exercise
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
      key: 'level1',
      title: t('level1Title'),
      description: t('level1Desc'),
      icon: <BookOpen size={20} />,
      color: 'amber',
      unlocked: true,
      lessons: [
        { id: 'l1_1', title: t('l1_1'), duration: '8', completed: completedLessons.has('l1_1') },
        { id: 'l1_2', title: t('l1_2'), duration: '12', completed: completedLessons.has('l1_2') },
        { id: 'l1_3', title: t('l1_3'), duration: '10', completed: completedLessons.has('l1_3') },
        { id: 'l1_4', title: t('l1_4'), duration: '8', completed: completedLessons.has('l1_4') },
      ]
    },
    {
      id: 2,
      key: 'level2',
      title: t('level2Title'),
      description: t('level2Desc'),
      icon: <Zap size={20} />,
      color: 'emerald',
      unlocked: stats.level1Completed,
      lessons: [
        { id: 'l2_1', title: t('l2_1'), duration: '15', completed: completedLessons.has('l2_1') },
        { id: 'l2_2', title: t('l2_2'), duration: '12', completed: completedLessons.has('l2_2') },
        { id: 'l2_3', title: t('l2_3'), duration: '10', completed: completedLessons.has('l2_3') },
        { id: 'l2_4', title: t('l2_4'), duration: '10', completed: completedLessons.has('l2_4') },
      ]
    },
    {
      id: 5,
      key: 'methodology',
      title: t('methodologyTitle'),
      description: t('methodologyDesc'),
      icon: <Route size={20} />,
      color: 'blue',
      unlocked: true, // Always unlocked
      lessons: [
        { id: 'm1_1', title: t('m1_1'), duration: '15', completed: completedLessons.has('m1_1') },
        { id: 'm1_2', title: t('m1_2'), duration: '12', completed: completedLessons.has('m1_2') },
        { id: 'm1_3', title: t('m1_3'), duration: '12', completed: completedLessons.has('m1_3') },
        { id: 'm1_4', title: t('m1_4'), duration: '15', completed: completedLessons.has('m1_4') },
      ]
    },
    {
      id: 6,
      key: 'aiLayer',
      title: t('aiLayerTitle'),
      description: t('aiLayerDesc'),
      icon: <Cpu size={20} />,
      color: 'cyan',
      unlocked: true, // Always unlocked
      lessons: [
        { id: 'ai_1', title: t('ai_1'), duration: '12', completed: completedLessons.has('ai_1') },
        { id: 'ai_2', title: t('ai_2'), duration: '15', completed: completedLessons.has('ai_2') },
        { id: 'ai_3', title: t('ai_3'), duration: '12', completed: completedLessons.has('ai_3') },
        { id: 'ai_4', title: t('ai_4'), duration: '15', completed: completedLessons.has('ai_4') },
      ]
    },
    {
      id: 3,
      key: 'level3',
      title: t('level3Title'),
      description: t('level3Desc'),
      icon: <Code size={20} />,
      color: 'purple',
      unlocked: false,
      lessons: [
        { id: 'l3_1', title: t('l3_1'), duration: '15', completed: completedLessons.has('l3_1') },
        { id: 'l3_2', title: t('l3_2'), duration: '12', completed: completedLessons.has('l3_2') },
        { id: 'l3_3', title: t('l3_3'), duration: '12', completed: completedLessons.has('l3_3') },
        { id: 'l3_4', title: t('l3_4'), duration: '10', completed: completedLessons.has('l3_4') },
      ]
    },
    {
      id: 4,
      key: 'level4',
      title: t('level4Title'),
      description: t('level4Desc'),
      icon: <Brain size={20} />,
      color: 'orange',
      unlocked: false,
      lessons: [
        { id: 'l4_1', title: t('l4_1'), duration: '20', completed: completedLessons.has('l4_1') },
        { id: 'l4_2', title: t('l4_2'), duration: '20', completed: completedLessons.has('l4_2') },
        { id: 'l4_3', title: t('l4_3'), duration: '20', completed: completedLessons.has('l4_3') },
        { id: 'l4_4', title: t('l4_4'), duration: '15', completed: completedLessons.has('l4_4') },
      ]
    }
  ];

  const getColorStyle = (color: string, unlocked: boolean): React.CSSProperties => {
    if (!unlocked) return { color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' };

    const colorMap: Record<string, React.CSSProperties> = {
      amber: { color: 'var(--color-accent)', backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-accent)' },
      emerald: { color: 'var(--color-success)', backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-success)' },
      purple: { color: 'var(--color-accent-secondary)', backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-accent-secondary)' },
      orange: { color: 'var(--color-warning)', backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-warning)' },
      blue: { color: '#3b82f6', backgroundColor: 'var(--color-bg-hover)', borderColor: '#3b82f6' },
      cyan: { color: '#06b6d4', backgroundColor: 'var(--color-bg-hover)', borderColor: '#06b6d4' },
    };
    return colorMap[color] || colorMap.amber;
  };

  // Render Learning Paths View
  const renderPathsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {t('pathsTitle')}
          </h2>
          <p className="text-sm text-muted">{t('pathsSubtitle')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {learningPaths.map(path => {
          const totalLessons = path.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          const completedCount = path.modules.reduce(
            (acc, m) => acc + m.lessons.filter(l => completedLessons.has(l)).length,
            0
          );
          const progress = Math.round((completedCount / totalLessons) * 100);

          return (
            <div
              key={path.id}
              className={`glass-card rounded-xl p-5 transition-all cursor-pointer ${
                selectedPath === path.id ? 'ring-2' : ''
              }`}
              style={selectedPath === path.id ? { borderColor: `var(--color-${path.color === 'blue' ? 'accent-secondary' : path.color})` } : {}}
              onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{path.icon}</div>
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {path.estimatedHours} {t('hours')}
                </span>
              </div>

              <h3 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {lt(path.role)}
              </h3>
              <p className="text-xs text-muted mb-4">{lt(path.description)}</p>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }}
                  />
                </div>
                <span className="text-xs text-muted">{progress}%</span>
              </div>

              {selectedPath === path.id && (
                <div className="mt-4 pt-4 space-y-3 animate-fadeIn" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {path.modules.map((module, idx) => (
                    <div key={module.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted">{idx + 1}.</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {lt(module.title)}
                        </span>
                      </div>
                      <div className="pl-4 space-y-1">
                        {module.lessons.map(lessonId => {
                          const lesson = allLessons.find(l => l.id === lessonId);
                          const isComplete = completedLessons.has(lessonId);
                          return lesson ? (
                            <button
                              key={lessonId}
                              onClick={(e) => { e.stopPropagation(); handleStartLesson(lessonId); }}
                              className="w-full flex items-center gap-2 text-left text-xs py-1 group"
                            >
                              <span className={isComplete ? 'text-emerald-500' : 'text-muted'}>
                                {isComplete ? <CheckCircle size={12} /> : <Play size={12} />}
                              </span>
                              <span className="text-muted group-hover:text-primary transition-colors">
                                {lt(lesson.title)}
                              </span>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Reference Materials View
  const renderReferenceView = () => (
    <div className="space-y-8">
      {/* Quick Reference Cards */}
      <div>
        <h3 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
          {t('quickRef')}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickReferenceCards.map(card => (
            <ReferenceCardComponent
              key={card.id}
              card={card}
              expanded={expandedRef === card.id}
              onToggle={() => setExpandedRef(expandedRef === card.id ? null : card.id)}
            />
          ))}
        </div>
      </div>

      {/* Checklists */}
      <div>
        <h3 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <ClipboardCheck size={18} style={{ color: 'var(--color-success)' }} />
          {t('checklistsTitle')}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {checklists.map(card => (
            <ReferenceCardComponent
              key={card.id}
              card={card}
              expanded={expandedRef === card.id}
              onToggle={() => setExpandedRef(expandedRef === card.id ? null : card.id)}
            />
          ))}
        </div>
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <FileText size={18} style={{ color: 'var(--color-accent-secondary)' }} />
          {t('templatesTitle')}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {interviewTemplates.map(card => (
            <ReferenceCardComponent
              key={card.id}
              card={card}
              expanded={expandedRef === card.id}
              onToggle={() => setExpandedRef(expandedRef === card.id ? null : card.id)}
            />
          ))}
        </div>
      </div>

      {/* Glossary Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <BookMarked size={18} style={{ color: 'var(--color-warning)' }} />
            {t('glossaryTitle')}
          </h3>
          <button
            onClick={() => setActiveView('glossary')}
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-accent)' }}
          >
            {t('viewGlossary')}
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {glossaryTerms.slice(0, 8).map((term) => (
            <div key={term.term.en} className="glass-card rounded-lg p-3">
              <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {lt(term.term)}
              </h4>
              <p className="text-micro text-muted line-clamp-2">{lt(term.definition)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Glossary View
  const renderGlossaryView = () => {
    const categories = ['core', 'ai', 'methodology', 'technical'] as const;
    const categoryLabels = { core: t('core'), ai: t('ai'), methodology: t('methodology'), technical: t('technical') };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('reference')}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-bg-hover)' }}
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t('glossaryTitle')}
            </h2>
            <p className="text-sm text-muted">{glossaryTerms.length} terms</p>
          </div>
        </div>

        {categories.map(category => (
          <div key={category}>
            <h3 className="text-sm font-medium mb-3 px-2" style={{ color: 'var(--color-text-secondary)' }}>
              {categoryLabels[category]}
            </h3>
            <div className="space-y-2">
              {glossaryTerms.filter(t => t.category === category).map((term) => (
                <div key={term.term.en} className="glass-card rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {lt(term.term)}
                  </h4>
                  <p className="text-sm text-muted">{lt(term.definition)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 h-full bg-[var(--color-bg-elevated)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
            <GraduationCap size={24} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('title')}</h1>
            <p className="text-sm text-muted">{t('subtitle')}</p>
          </div>
        </div>

        {/* Progress & Streak */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          {stats.streak > 0 && (
            <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-2">
              <Flame size={18} style={{ color: 'var(--color-warning)' }} />
              <span className="font-medium" style={{ color: 'var(--color-warning)' }}>{stats.streak}</span>
              <span className="text-xs text-muted">{t('streak')}</span>
            </div>
          )}

          {/* Progress */}
          <div className="glass-card rounded-xl px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted">{t('progress')}</div>
                <div className="text-lg font-medium text-gradient">{stats.overallPercent}%</div>
              </div>
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.overallPercent}%`, backgroundColor: 'var(--color-accent)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <TabButton
          active={activeView === 'main'}
          onClick={() => setActiveView('main')}
          icon={<Layers size={16} />}
          label={t('curriculum')}
        />
        <TabButton
          active={activeView === 'paths'}
          onClick={() => setActiveView('paths')}
          icon={<Users size={16} />}
          label={t('learningPaths')}
        />
        <TabButton
          active={activeView === 'reference' || activeView === 'glossary'}
          onClick={() => setActiveView('reference')}
          icon={<BookMarked size={16} />}
          label={t('reference')}
        />
      </div>

      {/* Main Content */}
      {activeView === 'main' && (
        <>
          {/* Learning Path */}
          <div className="space-y-4 mb-8">
            {levels.map((level, idx) => {
              const isExpanded = expandedLevel === level.key;
              const completedInLevel = level.lessons.filter(l => l.completed).length;
              const totalInLevel = level.lessons.length;
              const levelProgress = Math.round((completedInLevel / totalInLevel) * 100);

              return (
                <div
                  key={level.key}
                  className={`glass-card rounded-xl overflow-hidden transition-all ${
                    level.unlocked ? '' : 'opacity-60'
                  }`}
                >
                  {/* Level Header */}
                  <button
                    onClick={() => level.unlocked && setExpandedLevel(isExpanded ? null : level.key)}
                    disabled={!level.unlocked}
                    className={`w-full p-5 flex items-center gap-4 text-left transition-colors ${
                      level.unlocked ? '' : 'cursor-not-allowed'
                    }`}
                    style={level.unlocked ? {} : { opacity: 0.6 }}
                  >
                    {/* Level Icon */}
                    <div className="w-12 h-12 rounded-xl border flex items-center justify-center" style={getColorStyle(level.color, level.unlocked)}>
                      {level.unlocked ? level.icon : <Lock size={20} />}
                    </div>

                    {/* Level Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">
                          {level.key.startsWith('level') ? `Level ${level.id}` :
                           level.key === 'methodology' ? 'Module' : 'Specialization'}
                        </span>
                        {completedInLevel === totalInLevel && level.unlocked && (
                          <span className="flex items-center gap-1 text-micro" style={{ color: 'var(--color-success)' }}>
                            <CheckCircle size={10} />
                            {t('completed')}
                          </span>
                        )}
                        {(level.key === 'methodology' || level.key === 'aiLayer') && (
                          <span className="text-micro px-1.5 py-0.5 rounded" style={{
                            backgroundColor: 'var(--color-bg-hover)',
                            color: level.key === 'methodology' ? '#3b82f6' : '#06b6d4'
                          }}>
                            {level.key === 'methodology' ? 'NEW' : 'AI'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium" style={{ color: level.unlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                        {level.title}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{level.description}</p>
                    </div>

                    {/* Level Progress */}
                    <div className="flex items-center gap-4">
                      {level.unlocked ? (
                        <>
                          <div className="text-right">
                            <div className="text-xs text-muted">
                              {completedInLevel}/{totalInLevel} {t('lessons')}
                            </div>
                            <div className="w-20 h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${levelProgress}%`,
                                  backgroundColor: level.color === 'amber' ? 'var(--color-accent)' :
                                    level.color === 'emerald' ? 'var(--color-success)' :
                                    level.color === 'purple' ? 'var(--color-accent-secondary)' :
                                    level.color === 'blue' ? '#3b82f6' :
                                    level.color === 'cyan' ? '#06b6d4' : 'var(--color-warning)'
                                }}
                              />
                            </div>
                          </div>
                          <ChevronRight
                            size={20}
                            className={`text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </>
                      ) : (
                        <span className="text-xs text-muted">{t('locked')}</span>
                      )}
                    </div>
                  </button>

                  {/* Lessons List */}
                  {isExpanded && level.unlocked && (
                    <div className="p-4 space-y-2 animate-fadeIn" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
                      {level.lessons.map((lesson, lessonIdx) => {
                        const isLessonCompleted = completedLessons.has(lesson.id);
                        const hasContent = ['l1_', 'l2_', 'm1_', 'ai_'].some(prefix => lesson.id.startsWith(prefix));

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => hasContent && handleStartLesson(lesson.id)}
                            disabled={!hasContent}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group ${
                              hasContent ? '' : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {/* Lesson Number/Status */}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: isLessonCompleted ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                                color: isLessonCompleted ? 'var(--color-success)' : 'var(--color-text-muted)'
                              }}
                            >
                              {isLessonCompleted ? <CheckCircle size={14} /> : lessonIdx + 1}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-secondary group-hover:text-primary transition-colors">
                                {lesson.title}
                              </h4>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <Clock size={12} />
                              {lesson.duration} {t('minutes')}
                            </div>

                            {/* Play Button */}
                            {hasContent && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={16} style={{ color: 'var(--color-accent)' }} />
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {/* Start/Continue Button */}
                      {level.lessons.some(l => ['l1_', 'l2_', 'm1_', 'ai_'].some(prefix => l.id.startsWith(prefix))) && (
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
                            {completedInLevel > 0 ? t('continueLearning') : t('startLearning')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Practice Lab Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <FlaskConical size={20} style={{ color: 'var(--color-accent-secondary)' }} />
              </div>
              <div>
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('practiceLab')}</h2>
                <p className="text-xs text-muted">{t('practiceDesc')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {exercises.map(exercise => {
                const unlocked = isExerciseUnlocked(exercise);
                const score = completedExercises[exercise.id];
                const hasScore = score !== undefined;

                return (
                  <div
                    key={exercise.id}
                    className={`glass-card rounded-xl p-5 transition-all ${unlocked ? '' : 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg border flex items-center justify-center"
                        style={{
                          backgroundColor: unlocked ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                          borderColor: unlocked ? 'var(--color-accent)' : 'var(--color-border)',
                          color: unlocked ? 'var(--color-accent)' : 'var(--color-text-muted)'
                        }}
                      >
                        {unlocked ? <Target size={18} /> : <Lock size={18} />}
                      </div>
                      {hasScore && (
                        <div className="flex items-center gap-1 text-xs">
                          <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />
                          <span style={{ color: 'var(--color-success)' }}>{score}%</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-medium mb-1" style={{ color: unlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                      {lt(exercise.title)}
                    </h3>
                    <p className="text-xs text-muted mb-4">
                      {lt(exercise.description)}
                    </p>

                    {unlocked ? (
                      <button
                        onClick={() => setCurrentExercise(exercise)}
                        className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                        style={{
                          backgroundColor: 'var(--color-bg-hover)',
                          color: 'var(--color-accent)'
                        }}
                      >
                        <Play size={14} />
                        {hasScore ? t('continueLearning') : t('startExercise')}
                      </button>
                    ) : (
                      <div className="text-xs text-muted text-center py-2">
                        {t('exerciseLocked', { level: String(exercise.levelRequired) })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case Library Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                  <FolderOpen size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                </div>
                <div>
                  <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('caseLibrary')}</h2>
                  <p className="text-xs text-muted">{t('caseLibraryDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCaseBrowser(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-accent-secondary)' }}
              >
                {t('viewAllCases')}
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Case Preview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <CasePreviewCard
                icon={<Factory size={18} />}
                color="blue"
                title={t('casePreviews.smartProduction')}
                industry={t('casePreviews.manufacturing')}
                objects={4}
                actions={10}
                onClick={() => setShowCaseBrowser(true)}
              />
              <CasePreviewCard
                icon={<ShoppingCart size={18} />}
                color="emerald"
                title={t('casePreviews.smartInventory')}
                industry={t('casePreviews.retail')}
                objects={4}
                actions={10}
                onClick={() => setShowCaseBrowser(true)}
              />
              <CasePreviewCard
                icon={<Truck size={18} />}
                color="amber"
                title={t('casePreviews.smartDelivery')}
                industry={t('casePreviews.logistics')}
                objects={4}
                actions={12}
                onClick={() => setShowCaseBrowser(true)}
              />
            </div>
          </div>

          {/* Achievements Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <Award size={20} style={{ color: 'var(--color-warning)' }} />
              </div>
              <div>
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('achievements')}</h2>
                <p className="text-xs text-muted">{t('achievementsDesc')}</p>
              </div>
            </div>

            {stats.achievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="glass-card rounded-xl p-4 text-center"
                    style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg-hover)' }}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {lt(achievement.title)}
                    </h4>
                    <p className="text-micro text-muted">
                      {lt(achievement.description)}
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
                      <h4 className="text-sm font-medium text-muted mb-1">???</h4>
                      <p className="text-micro text-muted">
                        {t('lockedLabel')}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="text-3xl mb-3 opacity-40">🏆</div>
                <p className="text-sm text-muted">{t('noAchievements')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === 'paths' && renderPathsView()}
      {activeView === 'reference' && renderReferenceView()}
      {activeView === 'glossary' && renderGlossaryView()}

      {/* Achievement Popup */}
      {newAchievement && (
        <AchievementPopup
          achievement={newAchievement}
          onDismiss={dismissAchievement}
        />
      )}
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
      active ? 'btn-gradient' : ''
    }`}
    style={active ? {} : { backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}
  >
    {icon}
    {label}
  </button>
);

// Reference Card Component
const ReferenceCardComponent: React.FC<{
  card: ReferenceCard;
  expanded: boolean;
  onToggle: () => void;
}> = ({ card, expanded, onToggle }) => {
  const { lang, lt } = useAppTranslation('academy');
  return (
  <div className="glass-card rounded-xl overflow-hidden transition-all">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center gap-3 text-left"
    >
      <span className="text-xl">{card.icon}</span>
      <span className="flex-1 font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
        {lt(card.title)}
      </span>
      <ChevronDown
        size={16}
        className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
      />
    </button>
    {expanded && (
      <div className="px-4 pb-4 space-y-1 animate-fadeIn">
        {card.content[lang].map((line, idx) => (
          <p key={idx} className="text-xs text-muted" style={{ whiteSpace: 'pre-wrap' }}>
            {line}
          </p>
        ))}
      </div>
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
  const colorStyles: Record<string, React.CSSProperties> = {
    blue: { color: 'var(--color-accent-secondary)', backgroundColor: 'var(--color-bg-hover)' },
    emerald: { color: 'var(--color-success)', backgroundColor: 'var(--color-bg-hover)' },
    amber: { color: 'var(--color-accent)', backgroundColor: 'var(--color-bg-hover)' }
  };

  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 text-left transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={colorStyles[color]}>
          {icon}
        </div>
        <span className="text-micro text-muted">{industry}</span>
      </div>
      <h3 className="text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <div className="flex items-center gap-3 text-micro text-muted">
        <span>{objects} Objects</span>
        <span>•</span>
        <span>{actions} Actions</span>
      </div>
    </button>
  );
};

export default Academy;
