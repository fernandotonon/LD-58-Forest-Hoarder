import React from 'react';
import { useStore } from '../state/useStore';
import { ACHIEVEMENTS } from '../game/constants';

export default function AchievementUI() {
  const { achievements } = useStore();
  
  const getAchievementProgress = (achievement) => {
    const { stats } = achievements;
    const { condition } = achievement;
    
    switch (condition.type) {
      case 'collect':
        return { current: stats.itemsCollected, target: condition.total };
      case 'kill':
        return { current: stats.enemiesKilled, target: condition.total };
      case 'survive':
        return { current: stats.daysSurvived, target: condition.days };
      case 'season':
        return { current: stats.seasonsCompleted, target: condition.total };
      case 'upgrade':
        return { current: stats.upgradesBuilt, target: condition.total };
      case 'quest':
        return { current: stats.questsCompleted, target: condition.total };
      default:
        return { current: 0, target: 1 };
    }
  };
  
  const isUnlocked = (achievementId) => {
    return achievements.unlocked.includes(achievementId);
  };
  
  return (
    <div className="achievement-ui">
      <h3>Achievements</h3>
      <div className="achievement-grid">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlockedAchievement = isUnlocked(achievement.id);
          const { current, target } = getAchievementProgress(achievement);
          const progress = Math.min(100, (current / target) * 100);
          
          return (
            <div 
              key={achievement.id} 
              className={`achievement-item ${isUnlockedAchievement ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.icon}
              </div>
              <div className="achievement-info">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                {!isUnlockedAchievement && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{current}/{target}</span>
                  </div>
                )}
                {isUnlockedAchievement && (
                  <div className="achievement-reward">
                    {achievement.reward.materials && (
                      <span>
                        {achievement.reward.materials.leaf && `${achievement.reward.materials.leaf} leaves `}
                        {achievement.reward.materials.pine && `${achievement.reward.materials.pine} pine`}
                      </span>
                    )}
                    {achievement.reward.health && (
                      <span>+{achievement.reward.health} health</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}