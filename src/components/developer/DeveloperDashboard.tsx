import React, { useState } from 'react';
import {
  Terminal, Kanban, Plus, CheckCircle2, Clock,
  AlertCircle, Tag, User, ArrowRight, Code2, Database
} from 'lucide-react';
import { DevProject, DevTask } from '../../types';

interface DeveloperDashboardProps {
  projects: DevProject[];
  tasks: DevTask[];
  onUpdateTaskStatus: (taskId: string, status: DevTask['status']) => Promise<void>;
  onCreateTask: (task: any) => Promise<void>;
  onNavigate: (view: string) => void;
  lang: 'ar' | 'en';
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  projects = [],
  tasks = [],
  onUpdateTaskStatus,
  onCreateTask,
  onNavigate,
  lang,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<DevTask['priority']>('medium');
  const [taskAssignee, setTaskAssignee] = useState('سارة المنصور');

  const safeTasks = tasks || [];
  const safeProjects = projects || [];

  const filteredTasks = selectedProjectId === 'all'
    ? safeTasks
    : safeTasks.filter(t => t && t.projectId === selectedProjectId);

  const columns: Array<{ id: DevTask['status']; title: string; color: string }> = [
    { id: 'todo', title: 'قيد الانتظار (To Do)', color: 'border-slate-700 text-slate-300' },
    { id: 'in_progress', title: 'قيد التنفيذ (In Progress)', color: 'border-cyan-500/50 text-cyan-400' },
    { id: 'review', title: 'المراجعة المعمارية (Review)', color: 'border-purple-500/50 text-purple-400' },
    { id: 'done', title: 'مكتمل ومعتمد (Done)', color: 'border-emerald-500/50 text-emerald-400' },
  ];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateTask({
      projectId: selectedProjectId === 'all' ? 'proj_001' : selectedProjectId,
      title: taskTitle,
      description: taskDesc,
      status: 'todo',
      priority: taskPriority,
      assignee: taskAssignee,
      dueDate: '2026-09-30',
      tags: ['Sprint', 'Backend'],
    });
    setShowCreateTask(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            DEV SUITE v1.0
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>{lang === 'ar' ? 'لوحة فريق التطوير وإدارة السبرنت (Developer Workbench)' : 'Developer Workbench'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إدارة المشاريع، لوحة كانبان للمهام، توثيق OpenAPI التفاعلي، مستكشف قواعد البيانات، وفحص الاتساق'
              : 'Sprint Kanban, OpenAPI live playground, DB Schema inspector, and consistency suite'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dev_api')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>توثيق واختبار API</span>
          </button>
          <button
            onClick={() => onNavigate('dev_db')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>مستكشف البيانات</span>
          </button>
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Projects Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {proj.key}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Health: {proj.healthScore}%</span>
            </div>
            <h3 className="font-bold text-slate-100 text-sm">{proj.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Lead: {proj.lead}</span>
              <span>{proj.branchesCount} Branches Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Task Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Kanban className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ar' ? 'لوحة كانبان لمهام السبرنت (Kanban Task Board)' : 'Sprint Kanban Board'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">{filteredTasks.length} مهام نشطة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[400px]">
                <div className={`pb-3 mb-3 border-b flex items-center justify-between font-bold text-xs ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[10px]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-cyan-500/40 transition-all shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          task.priority === 'urgent'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : task.priority === 'high'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-slate-900 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{task.dueDate}</span>
                      </div>

                      <h4 className="font-bold text-slate-200 text-xs leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">{task.assignee}</span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {col.id !== 'todo' && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'todo')}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 text-[9px]"
                            >
                              ← ToDo
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'review' : 'done')}
                              className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-[9px] font-semibold"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>إضافة مهمة تطوير جديدة في السبرنت</span>
              </h3>
              <button onClick={() => setShowCreateTask(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">عنوان المهمة</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Rate Limiter Middleware"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">تفاصيل التنفيذ</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="شرح متطلبات الكود والعقود المعمارية..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">الأولوية</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="low">منخفضة (Low)</option>
                    <option value="medium">متوسطة (Medium)</option>
                    <option value="high">عالية (High)</option>
                    <option value="urgent">حرجة (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">المسؤول</label>
                  <input
                    type="text"
                    value={taskAssignee}
                    onChange={e => setTaskAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                >
                  إضافة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
