import { Trophy, Target, Zap, Award, Star, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'target' | 'zap' | 'award' | 'star' | 'trending' | 'check' | 'sparkles';
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-100
  total?: number;
  current?: number;
}

interface UserAchievementsProps {
  achievements: Achievement[];
  showProgress?: boolean;
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  zap: Zap,
  award: Award,
  star: Star,
  trending: TrendingUp,
  check: CheckCircle2,
  sparkles: Sparkles,
};

export function UserAchievements({ achievements, showProgress = true }: UserAchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Achievements
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#2BBBEF]">
              {completionPercentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-[#0C0F2C]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8]"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon];
          return (
            <motion.div
              key={achievement.id}
              className={`rounded-xl border p-4 transition-all ${
                achievement.unlocked
                  ? 'border-gray-200 bg-white shadow-md dark:border-white/10 dark:bg-[#161A3A]'
                  : 'border-gray-200 bg-gray-50 opacity-60 dark:border-white/5 dark:bg-[#0C0F2C]'
              }`}
              whileHover={{ scale: achievement.unlocked ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${achievement.color}`
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      achievement.unlocked ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {achievement.title}
                    </h4>
                    {achievement.unlocked && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#4AFFA8]" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>

                  {/* Progress Bar for incomplete achievements */}
                  {!achievement.unlocked && achievement.progress !== undefined && showProgress && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Progress</span>
                        <span>
                          {achievement.current}/{achievement.total}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8]"
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlock date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Unlocked {achievement.unlockedAt}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Compact achievement display for navigation/profile
export function AchievementBadgeCompact({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-3 py-1 dark:from-[#2BBBEF]/20 dark:to-[#4AFFA8]/20">
      <Trophy className="h-4 w-4 text-[#2BBBEF]" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
    </div>
  );
}
