import { useState } from 'react';
import {
  getActiveDailyTasks, getActiveWeeklyTasks, getActiveMonthlyTasks,
  STORY_TASKS,
} from '../../data/tasks';

const TABS = ['Stats', 'Daily', 'Weekly', 'Monthly', 'Story'];

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function StatRow({ label, value }) {
  return (
    <div className="journal-stat-row">
      <span className="journal-stat-label">{label}</span>
      <span className="journal-stat-value">{formatNumber(value)}</span>
    </div>
  );
}

function TaskCard({ task, progress, target, claimed, onClaim, taskType }) {
  const pct = Math.min(100, Math.floor((progress / target) * 100));
  const complete = progress >= target;
  const canClaim = complete && !claimed;

  return (
    <div className={`journal-task-card ${complete ? 'complete' : ''} ${claimed ? 'claimed' : ''}`}>
      <div className="journal-task-header">
        <span className="journal-task-name">{task.name}</span>
        {task.reward.gold && (
          <span className="journal-task-reward">+{task.reward.gold}g</span>
        )}
      </div>
      <div className="journal-task-desc">{task.description}</div>
      <div className="journal-task-progress-row">
        <div className="journal-task-bar">
          <div
            className="journal-task-bar-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="journal-task-count">
          {formatNumber(Math.min(progress, target))}/{formatNumber(target)}
        </span>
      </div>
      {canClaim && (
        <button
          className="btn btn-sm journal-task-claim"
          onClick={() => onClaim(task.id, taskType)}
        >
          Claim
        </button>
      )}
      {claimed && (
        <div className="journal-task-claimed-label">Claimed</div>
      )}
    </div>
  );
}

function StatsTab({ stats }) {
  const statGroups = [
    {
      title: 'Combat',
      items: [
        { label: 'Monsters Killed', value: stats.monstersKilled },
        { label: 'Bosses Killed', value: stats.bossesKilled },
        { label: 'Battles Won', value: stats.battlesWon },
        { label: 'Battles Lost', value: stats.battlesLost },
        { label: 'Battles Fled', value: stats.battlesRun },
        { label: 'Damage Dealt', value: stats.damageDealt },
        { label: 'Damage Taken', value: stats.damageTaken },
        { label: 'Highest Hit', value: stats.highestDamage },
        { label: 'Total Healing', value: stats.totalHealing },
      ],
    },
    {
      title: 'Economy',
      items: [
        { label: 'Gold Earned', value: stats.goldEarned },
        { label: 'Gold Spent', value: stats.goldSpent },
        { label: 'Items Looted', value: stats.itemsLooted },
        { label: 'Items Sold', value: stats.itemsSold },
      ],
    },
    {
      title: 'Progression',
      items: [
        { label: 'Levels Gained', value: stats.levelsGained },
        { label: 'Skills Unlocked', value: stats.skillsUnlocked },
        { label: 'Explorations', value: stats.explorationsCompleted },
        { label: 'Potions Used', value: stats.potionsUsed },
      ],
    },
  ];

  return (
    <div className="journal-stats-tab">
      {statGroups.map(group => (
        <div key={group.title} className="journal-stat-group">
          <div className="journal-stat-group-title">{group.title}</div>
          {group.items.map(item => (
            <StatRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TasksTab({ tasks, taskDefs, progressMap, claimedList, stats, taskType, onClaim }) {
  // For story tasks, progress comes from total stats
  // For daily/weekly/monthly, progress comes from the cycle's progress map
  const isStory = taskType === 'story';

  return (
    <div className="journal-tasks-tab">
      {taskDefs.length === 0 && (
        <div className="journal-empty">No tasks available.</div>
      )}
      {taskDefs.map(task => {
        const progress = isStory
          ? (stats[task.stat] || 0)
          : (progressMap[task.id] || 0);
        const claimed = claimedList.includes(task.id);
        return (
          <TaskCard
            key={task.id}
            task={task}
            progress={progress}
            target={task.target}
            claimed={claimed}
            onClaim={onClaim}
            taskType={taskType}
          />
        );
      })}
    </div>
  );
}

export default function JournalScreen({ stats, tasks, onClaim, onBack }) {
  const [activeTab, setActiveTab] = useState('Stats');
  const now = Date.now();

  const dailyTasks = getActiveDailyTasks(now);
  const weeklyTasks = getActiveWeeklyTasks(now);
  const monthlyTasks = getActiveMonthlyTasks(now);

  // Count unclaimed completions for badge
  const countReady = (defs, progressMap, claimedList, isStory) => {
    return defs.filter(t => {
      const prog = isStory ? (stats[t.stat] || 0) : (progressMap[t.id] || 0);
      return prog >= t.target && !claimedList.includes(t.id);
    }).length;
  };

  const badges = {
    Daily: countReady(dailyTasks, tasks.dailyProgress, tasks.dailyClaimed, false),
    Weekly: countReady(weeklyTasks, tasks.weeklyProgress, tasks.weeklyClaimed, false),
    Monthly: countReady(monthlyTasks, tasks.monthlyProgress, tasks.monthlyClaimed, false),
    Story: countReady(STORY_TASKS, {}, tasks.storyClaimed, true),
  };

  return (
    <div className="screen screen-journal">
      <div className="screen-header">Journal</div>

      <div className="journal-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`journal-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {badges[tab] > 0 && (
              <span className="journal-tab-badge">{badges[tab]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="journal-content">
        {activeTab === 'Stats' && <StatsTab stats={stats} />}
        {activeTab === 'Daily' && (
          <TasksTab
            tasks={tasks}
            taskDefs={dailyTasks}
            progressMap={tasks.dailyProgress}
            claimedList={tasks.dailyClaimed}
            stats={stats}
            taskType="daily"
            onClaim={onClaim}
          />
        )}
        {activeTab === 'Weekly' && (
          <TasksTab
            tasks={tasks}
            taskDefs={weeklyTasks}
            progressMap={tasks.weeklyProgress}
            claimedList={tasks.weeklyClaimed}
            stats={stats}
            taskType="weekly"
            onClaim={onClaim}
          />
        )}
        {activeTab === 'Monthly' && (
          <TasksTab
            tasks={tasks}
            taskDefs={monthlyTasks}
            progressMap={tasks.monthlyProgress}
            claimedList={tasks.monthlyClaimed}
            stats={stats}
            taskType="monthly"
            onClaim={onClaim}
          />
        )}
        {activeTab === 'Story' && (
          <TasksTab
            tasks={tasks}
            taskDefs={STORY_TASKS}
            progressMap={{}}
            claimedList={tasks.storyClaimed}
            stats={stats}
            taskType="story"
            onClaim={onClaim}
          />
        )}
      </div>

      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
