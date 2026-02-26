import React from 'react';
import Academy from '../components/Academy';
import type { Language } from '../types';

interface AcademyPageProps {
  lang: Language;
}

/**
 * 学习中心页面
 * 结构化课程、交互式练习、案例库
 */
export const AcademyPage: React.FC<AcademyPageProps> = ({ lang }) => (
  <Academy lang={lang} />
);
