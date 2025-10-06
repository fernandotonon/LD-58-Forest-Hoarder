import React from 'react';
import { useStore } from '../state/useStore';

export default function QuestUI() {
  const { quests, completeQuest, addMaterials, healPlayer, updatePlayer } = useStore();
  
  const handleCompleteQuest = (quest) => {
    // Give rewards
    if (quest.reward.type === 'materials') {
      if (quest.reward.leaf) addMaterials('leaf', quest.reward.leaf);
      if (quest.reward.pine) addMaterials('pine', quest.reward.pine);
    } else if (quest.reward.type === 'health') {
      healPlayer(quest.reward.amount);
    } else if (quest.reward.type === 'stamina') {
      updatePlayer({ stamina: Math.min(100, 100 + quest.reward.amount) });
    }
    
    completeQuest(quest.id);
  };
  
  const getQuestProgress = (quest) => {
    const progress = quests.progress[quest.id] || 0;
    let target = 0;
    
    if (quest.type === 'collect') {
      target = quest.target.quantity;
    } else if (quest.type === 'kill') {
      target = quest.target.quantity;
    } else if (quest.type === 'survive') {
      target = quest.target.time || quest.target.days;
    }
    
    return { current: progress, target, percent: Math.min(100, (progress / target) * 100) };
  };
  
  return (
    <div className="quest-ui">
      <h3>Daily Quests</h3>
      {quests.daily.length === 0 ? (
        <p>No active quests</p>
      ) : (
        quests.daily.map(quest => {
          const { current, target, percent } = getQuestProgress(quest);
          const isCompleted = current >= target;
          
          return (
            <div key={quest.id} className={`quest-item ${isCompleted ? 'completed' : ''}`}>
              <div className="quest-header">
                <h4>{quest.title}</h4>
                {isCompleted && (
                  <button 
                    className="quest-complete-btn"
                    onClick={() => handleCompleteQuest(quest)}
                  >
                    Complete
                  </button>
                )}
              </div>
              <p className="quest-description">{quest.description}</p>
              <div className="quest-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="progress-text">{current}/{target}</span>
              </div>
              <div className="quest-reward">
                Reward: {quest.reward.type === 'materials' ? 
                  `${quest.reward.leaf || 0} leaves, ${quest.reward.pine || 0} pine` :
                  `${quest.reward.amount} ${quest.reward.type}`
                }
              </div>
            </div>
          );
        })
      )}
      
      {quests.seasonal.length > 0 && (
        <>
          <h3>Seasonal Quests</h3>
          {quests.seasonal.map(quest => {
            const { current, target, percent } = getQuestProgress(quest);
            const isCompleted = current >= target;
            
            return (
              <div key={quest.id} className={`quest-item seasonal ${isCompleted ? 'completed' : ''}`}>
                <div className="quest-header">
                  <h4>{quest.title}</h4>
                  {isCompleted && (
                    <button 
                      className="quest-complete-btn"
                      onClick={() => handleCompleteQuest(quest)}
                    >
                      Complete
                    </button>
                  )}
                </div>
                <p className="quest-description">{quest.description}</p>
                <div className="quest-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="progress-text">{current}/{target}</span>
                </div>
                <div className="quest-reward">
                  Reward: {quest.reward.type === 'materials' ? 
                    `${quest.reward.leaf || 0} leaves, ${quest.reward.pine || 0} pine` :
                    `${quest.reward.amount} ${quest.reward.type}`
                  }
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}