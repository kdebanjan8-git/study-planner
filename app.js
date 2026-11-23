/**
 * Smart Study Planner - Core Application Logic
 * Features:
 * - Dynamic Subject & Exam Date Management
 * - Intelligent Multi-Subject Daily Schedule Generator with Interleaving & Buffer Days
 * - Day-by-Day Timetables with Exact Hourly Time Blocks & Breaks
 * - 3-Phase Roadmap & Weekly Calendar Grid Views
 * - One-Click Calendar Export (.ICS for Google/Apple/Outlook)
 * - Topic Progress Tracking & Real-Time Percentage Metrics
 * - Built-in Pomodoro Focus Timer with Web Audio Chimes
 * - Interactive Chart.js Visualizations & Confetti Celebrations
 * - LocalStorage Persistence
 */

// ==================== STATE MANAGEMENT ====================
const STORAGE_KEY = 'smart_study_planner_state_v1';

const defaultUsers = [
  {
    id: 'user_alex',
    name: 'Alex Chen',
    email: 'alex@study.io',
    password: 'password123',
    targetExam: 'University Semester Finals & Midterms',
    avatar: 'AC',
    createdAt: new Date().toISOString()
  }
];

const defaultSettings = {
  dailyHours: 3.5,
  sessionLength: 45,
  studyDays: [1, 2, 3, 4, 5, 6], // Mon=1 ... Sat=6 (Sun=0 off)
  revisionBufferDays: 2,
  windowStartTime: '08:30',
  theme: 'light',
  soundEnabled: true
};

let appState = {
  users: [...defaultUsers],
  currentUser: null, // null shows the login & sign in page
  subjects: [],
  topics: [],
  settings: { ...defaultSettings },
  studyLogs: [],
  activePlan: null,
  streak: {
    count: 1,
    lastStudyDate: new Date().toISOString().split('T')[0]
  }
};

let currentScheduleView = 'timeline'; // 'timeline', 'weekly', 'roadmap'
let currentWeeklyOffset = 0; // 0 = this week, 1 = next week, -1 = last week

// ==================== DEMO DATA GENERATOR ====================
function generateDemoData() {
  const now = new Date();
  
  // Future exam dates
  const examDate1 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days
  const examDate2 = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000); // 18 days
  const examDate3 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 25 days

  const s1Id = 'sub_' + Date.now() + '_1';
  const s2Id = 'sub_' + Date.now() + '_2';
  const s3Id = 'sub_' + Date.now() + '_3';

  const demoSubjects = [
    {
      id: s1Id,
      name: 'Calculus & Linear Algebra',
      examDate: examDate1.toISOString().slice(0, 16),
      targetGrade: 'A+',
      color: '#6366f1',
      createdAt: new Date().toISOString()
    },
    {
      id: s2Id,
      name: 'Organic Chemistry II',
      examDate: examDate2.toISOString().slice(0, 16),
      targetGrade: 'A',
      color: '#06b6d4',
      createdAt: new Date().toISOString()
    },
    {
      id: s3Id,
      name: 'Data Structures & Algorithms',
      examDate: examDate3.toISOString().slice(0, 16),
      targetGrade: 'A+',
      color: '#10b981',
      createdAt: new Date().toISOString()
    }
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const demoTopics = [
    // Calculus Topics
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s1Id,
      title: 'Limits & Continuity Theorems',
      estHours: 1.5,
      difficulty: 'easy',
      priority: 'high',
      status: 'completed',
      notes: 'Reviewed squeeze theorem and delta-epsilon proofs.',
      scheduledDate: todayStr,
      displayTime: '08:30 AM - 10:00 AM',
      startTime: '08:30',
      endTime: '10:00',
      completedAt: new Date().toISOString(),
      actualMinutes: 90
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s1Id,
      title: 'Derivatives & Chain Rule Applications',
      estHours: 2.0,
      difficulty: 'medium',
      priority: 'high',
      status: 'completed',
      notes: 'Practice parametric equations.',
      scheduledDate: todayStr,
      displayTime: '10:15 AM - 12:15 PM',
      startTime: '10:15',
      endTime: '12:15',
      completedAt: new Date().toISOString(),
      actualMinutes: 110
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s1Id,
      title: 'Integration by Parts & Trigonometric Substitution',
      estHours: 2.0,
      difficulty: 'hard',
      priority: 'normal',
      status: 'in_progress',
      notes: 'Formula: integral of u dv = uv - integral of v du',
      scheduledDate: todayStr,
      displayTime: '01:00 PM - 03:00 PM',
      startTime: '13:00',
      endTime: '15:00',
      completedAt: null,
      actualMinutes: 45
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s1Id,
      title: 'Eigenvalues & Matrix Diagonalization',
      estHours: 2.0,
      difficulty: 'hard',
      priority: 'normal',
      status: 'not_started',
      notes: 'Characteristic equation: det(A - lambda*I) = 0',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s1Id,
      title: 'Vector Spaces & Gram-Schmidt Process',
      estHours: 1.5,
      difficulty: 'medium',
      priority: 'normal',
      status: 'not_started',
      notes: 'Orthonormal basis conversion steps.',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },

    // Chemistry Topics
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s2Id,
      title: 'Electrophilic Aromatic Substitution (EAS)',
      estHours: 2.0,
      difficulty: 'medium',
      priority: 'high',
      status: 'completed',
      notes: 'Ortho/para vs meta directors table memorized.',
      scheduledDate: todayStr,
      displayTime: '08:30 AM - 10:30 AM',
      startTime: '08:30',
      endTime: '10:30',
      completedAt: new Date().toISOString(),
      actualMinutes: 85
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s2Id,
      title: 'Aldol & Claisen Condensations',
      estHours: 2.0,
      difficulty: 'hard',
      priority: 'normal',
      status: 'not_started',
      notes: 'Enolate ion formation and nucleophilic attack on carbonyl.',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s2Id,
      title: 'Nuclear Magnetic Resonance (1H & 13C NMR) Spectroscopy',
      estHours: 2.5,
      difficulty: 'hard',
      priority: 'high',
      status: 'not_started',
      notes: 'Chemical shifts, spin-spin splitting n+1 rule.',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s2Id,
      title: 'Carboxylic Acid Derivatives & Mechanisms',
      estHours: 1.5,
      difficulty: 'medium',
      priority: 'normal',
      status: 'not_started',
      notes: 'Reactivity order: Acyl chloride > Anhydride > Ester > Amide.',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },

    // DSA Topics
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s3Id,
      title: 'Binary Search Trees & AVL Balancing',
      estHours: 2.0,
      difficulty: 'medium',
      priority: 'high',
      status: 'completed',
      notes: 'Left & Right rotations, balance factor -1, 0, 1.',
      scheduledDate: todayStr,
      displayTime: '10:45 AM - 12:45 PM',
      startTime: '10:45',
      endTime: '12:45',
      completedAt: new Date().toISOString(),
      actualMinutes: 90
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s3Id,
      title: 'Graph Traversals (BFS, DFS & Topological Sort)',
      estHours: 2.0,
      difficulty: 'medium',
      priority: 'normal',
      status: 'not_started',
      notes: 'Kahn algorithm using in-degree array.',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s3Id,
      title: 'Dijkstra & Shortest Path Algorithms',
      estHours: 2.0,
      difficulty: 'hard',
      priority: 'high',
      status: 'not_started',
      notes: 'Priority queue implementation O((V + E) log V).',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    },
    {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId: s3Id,
      title: 'Dynamic Programming: 0/1 Knapsack & LCS',
      estHours: 2.5,
      difficulty: 'hard',
      priority: 'high',
      status: 'not_started',
      notes: 'Memoization table states and space optimization.',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    }
  ];

  return {
    users: [...defaultUsers],
    currentUser: null,
    subjects: demoSubjects,
    topics: demoTopics,
    settings: { ...defaultSettings },
    studyLogs: [
      { id: 'log_1', durationMinutes: 90, timestamp: new Date().toISOString() },
      { id: 'log_2', durationMinutes: 110, timestamp: new Date().toISOString() }
    ],
    activePlan: null,
    streak: { count: 3, lastStudyDate: todayStr }
  };
}

// ==================== LOCAL STORAGE ====================
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = {
        users: (parsed.users && parsed.users.length) ? parsed.users : [...defaultUsers],
        currentUser: parsed.currentUser || null,
        subjects: parsed.subjects || [],
        topics: parsed.topics || [],
        settings: { ...defaultSettings, ...(parsed.settings || {}) },
        studyLogs: parsed.studyLogs || [],
        activePlan: parsed.activePlan || null,
        streak: parsed.streak || { count: 1, lastStudyDate: new Date().toISOString().split('T')[0] }
      };
    } else {
      appState = generateDemoData();
      saveState();
      smartGenerateSchedule(false);
    }
  } catch (err) {
    console.warn('Could not load existing state, generating fresh data', err);
    appState = generateDemoData();
    saveState();
    smartGenerateSchedule(false);
  }
}

// ==================== TIME FORMATTING HELPERS ====================
function addMinutesToTime(timeStr, minutesToAdd) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m + Math.round(minutesToAdd);
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDisplayDate(dateInput) {
  if (!dateInput || dateInput === 'Unscheduled') return 'Unscheduled';
  const [y, m, d] = dateInput.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function formatDisplayDateTime(dateInput) {
  if (!dateInput) return 'Not set';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getDaysRemaining(targetDateStr) {
  const now = new Date();
  const target = new Date(targetDateStr);
  const diffMs = target - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getDifficultyMultiplier(difficulty) {
  switch (difficulty) {
    case 'easy': return 0.8;
    case 'hard': return 1.3;
    case 'medium':
    default: return 1.0;
  }
}

// ==================== STUDY PLAN GENERATOR WIZARD ====================
function openPlanGeneratorModal() {
  const todayStr = new Date().toISOString().split('T')[0];
  const startDateInput = document.getElementById('planStartDate');
  if (startDateInput) {
    startDateInput.value = todayStr;
    startDateInput.min = todayStr;
  }

  // Pre-fill inputs from settings
  const dailyHours = appState.settings.dailyHours || 3.5;
  document.getElementById('planDailyHoursInput').value = dailyHours;

  // Highlight intensity card
  document.querySelectorAll('#planIntensityOptions .intensity-card').forEach(card => {
    if (parseFloat(card.getAttribute('data-hours')) === dailyHours) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Time window card
  const startTime = appState.settings.windowStartTime || '08:30';
  document.getElementById('planStartTimeInput').value = startTime;
  document.querySelectorAll('#planTimeWindowOptions .timeslot-card').forEach(card => {
    if (card.getAttribute('data-start') === startTime) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Revision buffer
  const bufferSelect = document.getElementById('planRevisionBuffer');
  if (bufferSelect) {
    bufferSelect.value = appState.settings.revisionBufferDays || 2;
  }

  // Days of week
  const studyDays = appState.settings.studyDays || [1, 2, 3, 4, 5, 6];
  document.getElementById('planDayMon').checked = studyDays.includes(1);
  document.getElementById('planDayTue').checked = studyDays.includes(2);
  document.getElementById('planDayWed').checked = studyDays.includes(3);
  document.getElementById('planDayThu').checked = studyDays.includes(4);
  document.getElementById('planDayFri').checked = studyDays.includes(5);
  document.getElementById('planDaySat').checked = studyDays.includes(6);
  document.getElementById('planDaySun').checked = studyDays.includes(0);

  updatePlanProjection();
  openModal('modalPlanGenerator');
}

function updatePlanProjection() {
  const box = document.getElementById('planProjectionBox');
  if (!box) return;

  const pendingTopics = appState.topics.filter(t => t.status !== 'completed');
  const totalEffort = pendingTopics.reduce((acc, t) => acc + (t.estHours || 1.5), 0);
  const dailyHours = parseFloat(document.getElementById('planDailyHoursInput')?.value) || 3.5;
  const estimatedDays = Math.ceil(totalEffort / dailyHours) || 1;
  const buffer = parseInt(document.getElementById('planRevisionBuffer')?.value) || 2;

  box.innerHTML = `
    <div style="font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
      <i class="fa-solid fa-chart-line"></i> Estimated Plan Projection
    </div>
    <div>
      • <strong>${pendingTopics.length} chapters</strong> across <strong>${appState.subjects.length} subjects</strong> (~${totalEffort.toFixed(1)} total study hours).<br>
      • At <strong>${dailyHours} hrs/day</strong>, your syllabus will be completed in <strong>~${estimatedDays} active study days</strong>.<br>
      • <strong>${buffer} revision buffer days</strong> are automatically reserved before each exam for mock tests & active recall.
    </div>
  `;
}

function handlePlanGeneratorSubmit(e) {
  e.preventDefault();

  const dailyHours = parseFloat(document.getElementById('planDailyHoursInput').value) || 3.5;
  const windowStartTime = document.getElementById('planStartTimeInput').value || '08:30';
  const startDateStr = document.getElementById('planStartDate').value || new Date().toISOString().split('T')[0];
  const revisionBufferDays = parseInt(document.getElementById('planRevisionBuffer').value) || 2;

  const studyDays = [];
  if (document.getElementById('planDayMon').checked) studyDays.push(1);
  if (document.getElementById('planDayTue').checked) studyDays.push(2);
  if (document.getElementById('planDayWed').checked) studyDays.push(3);
  if (document.getElementById('planDayThu').checked) studyDays.push(4);
  if (document.getElementById('planDayFri').checked) studyDays.push(5);
  if (document.getElementById('planDaySat').checked) studyDays.push(6);
  if (document.getElementById('planDaySun').checked) studyDays.push(0);

  // Update settings
  appState.settings.dailyHours = dailyHours;
  appState.settings.windowStartTime = windowStartTime;
  appState.settings.revisionBufferDays = revisionBufferDays;
  appState.settings.studyDays = studyDays;

  // Run generation
  smartGenerateSchedule(true, {
    startDate: startDateStr,
    dailyHours,
    startTime: windowStartTime,
    revisionBufferDays,
    studyDays
  });

  closeModal('modalPlanGenerator');

  // Immediately take user to the actual Daily Schedule & Roadmap tab!
  switchTab('schedule');
  triggerCelebration();
}

// ==================== SMART SCHEDULING ENGINE ====================
/**
 * Intelligent Schedule Generator:
 * 1. Urgency Weighting: Proximity of exams prioritizes subject order.
 * 2. Cognitive Interleaving: Mixes subjects across days to prevent burnout.
 * 3. Daily Hourly Timetables: Generates precise starting and ending time slots with 15m breaks.
 * 4. Pre-Exam Buffer: Protects final days before exams exclusively for mocks and revision.
 * 5. 3-Phase Roadmap: Core foundations -> Deep Dive problem solving -> Mock exams.
 */
function smartGenerateSchedule(showNotification = true, customOptions = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const opts = customOptions || {};
  const startDateStr = opts.startDate || new Date().toISOString().split('T')[0];
  const [sY, sM, sD] = startDateStr.split('-').map(Number);
  const startDay = new Date(sY, sM - 1, sD);
  startDay.setHours(0, 0, 0, 0);

  const dailyCapacityHours = opts.dailyHours || parseFloat(appState.settings.dailyHours) || 3.5;
  const studyDaysOfWeek = opts.studyDays || appState.settings.studyDays || [1, 2, 3, 4, 5, 6];
  const revisionBuffer = opts.revisionBufferDays !== undefined ? opts.revisionBufferDays : (parseInt(appState.settings.revisionBufferDays) || 2);
  const defaultStartTime = opts.startTime || appState.settings.windowStartTime || '08:30';

  const validSubjects = appState.subjects.filter(s => {
    const examDate = new Date(s.examDate);
    examDate.setHours(23, 59, 59, 999);
    return examDate >= today;
  });

  if (validSubjects.length === 0) {
    if (showNotification) {
      showToast('Please add at least one subject with an upcoming exam date!', 'warning');
    }
    return;
  }

  const pendingTopics = appState.topics.filter(t => t.status !== 'completed');

  if (pendingTopics.length === 0) {
    if (showNotification) {
      showToast('All topics are completed! Great job!', 'success');
    }
    return;
  }

  // Calculate subject urgency
  const subjectMap = {};
  validSubjects.forEach(s => {
    const examDate = new Date(s.examDate);
    examDate.setHours(0, 0, 0, 0);
    const daysUntilExam = Math.max(1, Math.ceil((examDate - startDay) / (1000 * 60 * 60 * 24)));
    
    const subTopics = pendingTopics.filter(t => t.subjectId === s.id);
    const totalRemainingEffort = subTopics.reduce((acc, t) => acc + (t.estHours * getDifficultyMultiplier(t.difficulty)), 0);

    const urgencyScore = totalRemainingEffort / daysUntilExam;

    subjectMap[s.id] = {
      subject: s,
      daysUntilExam,
      examDate,
      topics: subTopics,
      urgencyScore
    };
  });

  const priorityOrder = { high: 1, normal: 2, low: 3 };
  const diffOrder = { hard: 1, medium: 2, easy: 3 };

  // Interleaved sorting of unassigned topics
  let unassignedTopics = [...pendingTopics];
  unassignedTopics.sort((a, b) => {
    const subA = subjectMap[a.subjectId];
    const subB = subjectMap[b.subjectId];
    if (!subA || !subB) return 0;
    
    const urgencyDiff = subB.urgencyScore - subA.urgencyScore;
    if (Math.abs(urgencyDiff) > 0.05) return urgencyDiff;

    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });

  let currentDate = new Date(startDay);
  const maxDaysHorizon = 120;
  let dayStep = 0;
  const scheduledDatesSet = new Set();

  while (unassignedTopics.length > 0 && dayStep < maxDaysHorizon) {
    const dayOfWeek = currentDate.getDay();

    if (studyDaysOfWeek.includes(dayOfWeek)) {
      let dayHoursUsed = 0;
      const dayDateStr = currentDate.toISOString().split('T')[0];
      let currentSessionTime = defaultStartTime;
      const assignedThisDaySubjectIds = new Set();

      // Pick topics for this study day
      for (let i = 0; i < unassignedTopics.length; i++) {
        const candidateTopic = unassignedTopics[i];
        const subInfo = subjectMap[candidateTopic.subjectId];
        if (!subInfo) continue;

        // Check revision buffer
        const daysToExam = Math.ceil((subInfo.examDate - currentDate) / (1000 * 60 * 60 * 24));
        if (daysToExam <= revisionBuffer && daysToExam >= 0) {
          continue; // Reserve for revision buffer
        }
        if (daysToExam < 0) continue; // Exam already passed

        // Interleaving preference
        if (assignedThisDaySubjectIds.has(candidateTopic.subjectId) && unassignedTopics.some(t => !assignedThisDaySubjectIds.has(t.subjectId))) {
          continue;
        }

        // Schedule topic with explicit time blocks!
        const durationHours = candidateTopic.estHours || 1.5;
        const durationMins = durationHours * 60;
        const endTime = addMinutesToTime(currentSessionTime, durationMins);

        candidateTopic.scheduledDate = dayDateStr;
        candidateTopic.startTime = currentSessionTime;
        candidateTopic.endTime = endTime;
        candidateTopic.displayTime = `${formatTime12h(currentSessionTime)} - ${formatTime12h(endTime)}`;

        dayHoursUsed += durationHours;
        assignedThisDaySubjectIds.add(candidateTopic.subjectId);
        scheduledDatesSet.add(dayDateStr);

        // Next session starts after 15m break
        currentSessionTime = addMinutesToTime(endTime, 15);

        unassignedTopics.splice(i, 1);
        i--;

        if (dayHoursUsed >= dailyCapacityHours) break;
      }

      // If day still has room, fill remaining
      if (dayHoursUsed < dailyCapacityHours && unassignedTopics.length > 0) {
        for (let i = 0; i < unassignedTopics.length; i++) {
          const candidateTopic = unassignedTopics[i];
          const subInfo = subjectMap[candidateTopic.subjectId];
          if (!subInfo) continue;

          const daysToExam = Math.ceil((subInfo.examDate - currentDate) / (1000 * 60 * 60 * 24));
          if (daysToExam < 0) continue;

          const durationHours = candidateTopic.estHours || 1.5;
          const durationMins = durationHours * 60;
          const endTime = addMinutesToTime(currentSessionTime, durationMins);

          candidateTopic.scheduledDate = dayDateStr;
          candidateTopic.startTime = currentSessionTime;
          candidateTopic.endTime = endTime;
          candidateTopic.displayTime = `${formatTime12h(currentSessionTime)} - ${formatTime12h(endTime)}`;

          dayHoursUsed += durationHours;
          scheduledDatesSet.add(dayDateStr);
          currentSessionTime = addMinutesToTime(endTime, 15);

          unassignedTopics.splice(i, 1);
          i--;

          if (dayHoursUsed >= dailyCapacityHours) break;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    dayStep++;
  }

  // Any remaining overflow topics
  if (unassignedTopics.length > 0) {
    const fallbackDateStr = currentDate.toISOString().split('T')[0];
    unassignedTopics.forEach(t => {
      t.scheduledDate = fallbackDateStr;
      t.displayTime = 'Flexible Block';
    });
  }

  // Generate 3-Phase Roadmap Data
  const sortedDatesList = Array.from(scheduledDatesSet).sort();
  const totalStudyDays = sortedDatesList.length;
  const firstStudyDay = sortedDatesList[0] || startDateStr;
  const lastStudyDay = sortedDatesList[sortedDatesList.length - 1] || startDateStr;

  const phase1EndIdx = Math.max(0, Math.floor(totalStudyDays * 0.45));
  const phase2EndIdx = Math.max(phase1EndIdx, totalStudyDays - 1);

  appState.activePlan = {
    generatedAt: new Date().toISOString(),
    startDate: firstStudyDay,
    endDate: lastStudyDay,
    totalStudyDays,
    dailyHours: dailyCapacityHours,
    startTime: defaultStartTime,
    phases: [
      {
        id: 1,
        title: 'Phase 1: Foundation & Core Concepts',
        dateRange: `${formatDisplayDate(firstStudyDay)} – ${formatDisplayDate(sortedDatesList[phase1EndIdx] || firstStudyDay)}`,
        desc: 'Master fundamental principles, formulas, and high-priority theory for all subjects.'
      },
      {
        id: 2,
        title: 'Phase 2: In-Depth Practice & Problem Solving',
        dateRange: `${formatDisplayDate(sortedDatesList[phase1EndIdx + 1] || firstStudyDay)} – ${formatDisplayDate(sortedDatesList[phase2EndIdx] || lastStudyDay)}`,
        desc: 'Deep dive into complex calculations, coding algorithms, active recall, and sample problems.'
      },
      {
        id: 3,
        title: 'Phase 3: Pre-Exam Mocks & Buffer Revision',
        dateRange: `Final ${revisionBuffer} days before each exam date`,
        desc: 'Full timed mock tests, rapid formula sheet review, and confidence building under test conditions.'
      }
    ]
  };

  saveState();
  renderAll();

  if (showNotification) {
    showToast('Master Study Plan generated! Daily timetable, weekly grid & roadmap ready.', 'success');
  }
}

// ==================== RENDERING ALL VIEWS ====================
function renderAll() {
  updateMetricsBanner();
  renderDashboardToday();
  renderDashboardSubjectCards();
  renderUpcomingExams();
  renderDailySchedule();
  renderSubjectsTab();
  populateDropdowns();
  updateAnalyticsCharts();
}

// 1. Top Metrics Banner
function updateMetricsBanner() {
  const totalTopics = appState.topics.length;
  const completedTopics = appState.topics.filter(t => t.status === 'completed').length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const metricProgress = document.getElementById('metricProgressPercent');
  if (metricProgress) metricProgress.textContent = `${progressPercent}%`;

  const metricTopics = document.getElementById('metricTopicsRatio');
  if (metricTopics) metricTopics.textContent = `${completedTopics} / ${totalTopics}`;

  const metricNext = document.getElementById('metricNextExam');
  if (metricNext) {
    const upcoming = getSortedUpcomingExams();
    if (upcoming.length > 0) {
      const days = getDaysRemaining(upcoming[0].examDate);
      metricNext.textContent = days === 0 ? 'Today!' : days < 0 ? 'Overdue' : `${days}d (${upcoming[0].name.slice(0, 10)}...)`;
    } else {
      metricNext.textContent = 'None set';
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTopics = appState.topics.filter(t => t.scheduledDate === todayStr);
  const todayDone = todayTopics.filter(t => t.status === 'completed').length;
  const metricToday = document.getElementById('metricTodayGoals');
  if (metricToday) metricToday.textContent = `${todayDone} / ${todayTopics.length}`;

  const metricStreak = document.getElementById('metricStreak');
  if (metricStreak) metricStreak.textContent = `${appState.streak.count || 1} Days 🔥`;

  // Circular Gauge
  const ring = document.getElementById('overallProgressRing');
  const ringText = document.getElementById('overallPercentageBig');
  const summaryText = document.getElementById('overallProgressSummary');
  const readinessBadge = document.getElementById('examReadinessBadge');

  if (ring && ringText) {
    const circumference = 2 * Math.PI * 58;
    const offset = circumference - (progressPercent / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ringText.textContent = `${progressPercent}%`;
  }

  if (summaryText) {
    summaryText.textContent = `${completedTopics} of ${totalTopics} topics mastered across ${appState.subjects.length} subjects.`;
  }

  if (readinessBadge) {
    if (progressPercent >= 80) {
      readinessBadge.textContent = 'Exam Ready';
      readinessBadge.className = 'exam-countdown-badge badge-safe';
    } else if (progressPercent >= 50) {
      readinessBadge.textContent = 'On Track';
      readinessBadge.className = 'exam-countdown-badge badge-safe';
    } else if (progressPercent >= 25) {
      readinessBadge.textContent = 'In Progress';
      readinessBadge.className = 'exam-countdown-badge badge-moderate';
    } else {
      readinessBadge.textContent = 'Needs Focus';
      readinessBadge.className = 'exam-countdown-badge badge-urgent';
    }
  }
}

// 2. Dashboard - Today's Agenda (with Time Slots)
function renderDashboardToday() {
  const container = document.getElementById('todayTaskList');
  const dateBadge = document.getElementById('todayDateBadge');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  if (dateBadge) {
    dateBadge.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  const todayTopics = appState.topics.filter(t => t.scheduledDate === todayStr);

  if (todayTopics.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem 1rem;">
        <i class="fa-regular fa-calendar-check empty-state-icon"></i>
        <div class="empty-state-title">No tasks scheduled for today</div>
        <p class="empty-state-desc">Click "Generate Schedule" to build your day-by-day plan with exact time blocks.</p>
        <button class="btn btn-primary btn-sm" onclick="openPlanGeneratorModal()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Study Plan
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  todayTopics.forEach(topic => {
    const subject = appState.subjects.find(s => s.id === topic.subjectId) || { name: 'Subject', color: '#6366f1' };
    const isCompleted = topic.status === 'completed';

    html += `
      <div class="task-item ${isCompleted ? 'completed' : ''}" data-topic-id="${topic.id}">
        <div class="task-left">
          <div class="task-checkbox" onclick="toggleTopicStatus('${topic.id}')" title="Click to toggle completed">
            ${isCompleted ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <div class="task-details">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              ${topic.displayTime ? `<span class="time-slot-badge"><i class="fa-regular fa-clock"></i> ${topic.displayTime}</span>` : ''}
              <span class="task-title">${escapeHtml(topic.title)}</span>
            </div>
            <div class="task-meta">
              <span class="subject-badge" style="background: ${subject.color};">
                ${escapeHtml(subject.name)}
              </span>
              <span><i class="fa-regular fa-hourglass"></i> ${topic.estHours} hrs</span>
              <span class="task-tag diff-${topic.difficulty}">${capitalize(topic.difficulty)}</span>
              ${topic.priority === 'high' ? '<span class="task-tag diff-hard" style="font-size: 0.65rem;">High Priority</span>' : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="btn btn-secondary btn-sm" onclick="startFocusWithTopic('${topic.id}')" title="Study this with Focus Timer">
            <i class="fa-solid fa-play"></i> Focus
          </button>
          <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditTopicModal('${topic.id}')" title="Edit Topic">
            <i class="fa-solid fa-pen"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 3. Dashboard - Subject Cards with Progress Bars
function renderDashboardSubjectCards() {
  const container = document.getElementById('dashboardSubjectCards');
  if (!container) return;

  if (appState.subjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-book empty-state-icon"></i>
        <div class="empty-state-title">No subjects added yet</div>
        <p class="empty-state-desc">Add your course subjects and upcoming exam dates to begin tracking.</p>
        <button class="btn btn-primary" onclick="openAddSubjectModal()">+ Add Subject</button>
      </div>
    `;
    return;
  }

  let html = '';
  appState.subjects.forEach(subject => {
    const subTopics = appState.topics.filter(t => t.subjectId === subject.id);
    const totalCount = subTopics.length;
    const completedCount = subTopics.filter(t => t.status === 'completed').length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const daysLeft = getDaysRemaining(subject.examDate);

    html += `
      <div class="subject-card">
        <div class="subject-card-bar" style="background: ${subject.color};"></div>
        <div class="subject-header">
          <div>
            <h4 class="subject-name">${escapeHtml(subject.name)}</h4>
            <div class="subject-exam-date">
              <i class="fa-regular fa-calendar"></i> Exam: ${formatDisplayDate(subject.examDate)}
              (${daysLeft >= 0 ? `${daysLeft} days left` : 'Passed'})
            </div>
          </div>
          <span class="subject-badge" style="background: ${subject.color};">
            ${subject.targetGrade ? `Goal: ${escapeHtml(subject.targetGrade)}` : 'Target'}
          </span>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
            <span style="font-weight: 600; color: var(--text-main);">${completedCount} of ${totalCount} topics finished</span>
            <span style="font-weight: 700; color: ${subject.color};">${percent}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%; background: ${subject.color};"></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            <i class="fa-solid fa-layer-group"></i> ${totalCount} Chapters
          </span>
          <button class="btn btn-secondary btn-sm" onclick="openTopicModalForSubject('${subject.id}')">
            + Add Topic
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 4. Upcoming Exams List
function getSortedUpcomingExams() {
  return [...appState.subjects].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
}

function renderUpcomingExams() {
  const container = document.getElementById('upcomingExamsList');
  if (!container) return;

  const exams = getSortedUpcomingExams();
  if (exams.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.825rem; color: var(--text-muted); text-align: center; padding: 1rem;">
        No upcoming exams recorded.
      </div>
    `;
    return;
  }

  let html = '';
  exams.forEach(sub => {
    const days = getDaysRemaining(sub.examDate);
    let badgeClass = 'badge-safe';
    let label = `${days} days`;

    if (days < 0) {
      badgeClass = 'badge-urgent';
      label = 'Ended';
    } else if (days === 0) {
      badgeClass = 'badge-urgent';
      label = 'TODAY!';
    } else if (days <= 3) {
      badgeClass = 'badge-urgent';
      label = `${days}d Critical`;
    } else if (days <= 10) {
      badgeClass = 'badge-moderate';
      label = `${days}d Approaching`;
    }

    html += `
      <div class="exam-countdown-card" style="border-left-color: ${sub.color};">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${escapeHtml(sub.name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            <i class="fa-regular fa-clock"></i> ${formatDisplayDateTime(sub.examDate)}
          </div>
        </div>
        <span class="exam-countdown-badge ${badgeClass}">
          ${label}
        </span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==================== DAILY SCHEDULE, WEEKLY GRID & ROADMAP ====================
function setScheduleView(viewName) {
  currentScheduleView = viewName;

  document.querySelectorAll('.schedule-view-btn').forEach(btn => btn.classList.remove('active'));
  if (viewName === 'timeline') document.getElementById('btnViewTimeline')?.classList.add('active');
  if (viewName === 'weekly') document.getElementById('btnViewWeekly')?.classList.add('active');
  if (viewName === 'roadmap') document.getElementById('btnViewRoadmap')?.classList.add('active');

  const timelineCont = document.getElementById('scheduleTimelineContainer');
  const weeklyCont = document.getElementById('scheduleWeeklyContainer');
  const roadmapCont = document.getElementById('scheduleRoadmapContainer');

  if (timelineCont) timelineCont.style.display = viewName === 'timeline' ? 'block' : 'none';
  if (weeklyCont) weeklyCont.style.display = viewName === 'weekly' ? 'block' : 'none';
  if (roadmapCont) roadmapCont.style.display = viewName === 'roadmap' ? 'block' : 'none';

  if (viewName === 'weekly') renderWeeklyGrid();
  if (viewName === 'roadmap') renderMasterRoadmap();
}

function renderDailySchedule() {
  renderPlanHeroBanner();
  renderDailyTimeline();
  if (currentScheduleView === 'weekly') renderWeeklyGrid();
  if (currentScheduleView === 'roadmap') renderMasterRoadmap();
}

// Render Hero Banner at top of Schedule tab
function renderPlanHeroBanner() {
  const pillsCont = document.getElementById('planHeroPills');
  const phasesCont = document.getElementById('planHeroRoadmap');
  const plan = appState.activePlan;

  if (!plan) return;

  if (pillsCont) {
    const totalHours = appState.topics.reduce((acc, t) => acc + (t.estHours || 1.5), 0);
    pillsCont.innerHTML = `
      <span class="plan-pill"><i class="fa-regular fa-calendar-check" style="color: var(--primary);"></i> ${formatDisplayDate(plan.startDate)} – ${formatDisplayDate(plan.endDate)}</span>
      <span class="plan-pill"><i class="fa-solid fa-stopwatch" style="color: var(--secondary);"></i> ${plan.dailyHours} hrs / day</span>
      <span class="plan-pill"><i class="fa-regular fa-clock" style="color: var(--warning);"></i> ~${totalHours.toFixed(1)} Total Hours</span>
      <span class="plan-pill"><i class="fa-solid fa-layer-group" style="color: var(--success);"></i> ${appState.topics.length} Chapters</span>
      <span class="plan-pill"><i class="fa-solid fa-mug-hot" style="color: #b45309;"></i> 15m Breaks Included</span>
    `;
  }

  if (phasesCont && plan.phases) {
    phasesCont.innerHTML = plan.phases.map(p => `
      <div class="phase-card phase-${p.id}">
        <div class="phase-name">Phase ${p.id}</div>
        <div class="phase-desc">${escapeHtml(p.title.replace(/^Phase \d+: /, ''))}</div>
        <div class="phase-dates"><i class="fa-regular fa-calendar"></i> ${p.dateRange}</div>
        <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.25rem;">${escapeHtml(p.desc)}</div>
      </div>
    `).join('');
  }
}

// Render Day-by-Day Timeline
function renderDailyTimeline() {
  const container = document.getElementById('scheduleTimelineContainer');
  const subjectFilter = document.getElementById('scheduleSubjectFilter')?.value || 'all';
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];

  const dateGroups = {};
  appState.topics.forEach(topic => {
    if (subjectFilter !== 'all' && topic.subjectId !== subjectFilter) {
      return;
    }
    const d = topic.scheduledDate || 'Unscheduled';
    if (!dateGroups[d]) dateGroups[d] = [];
    dateGroups[d].push(topic);
  });

  const sortedDates = Object.keys(dateGroups).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return a.localeCompare(b);
  });

  if (sortedDates.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-calendar-xmark empty-state-icon"></i>
        <div class="empty-state-title">No schedule generated yet</div>
        <p class="empty-state-desc">Click "Customize Plan" to generate your personalized study timetable.</p>
        <button class="btn btn-primary" onclick="openPlanGeneratorModal()">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Study Plan
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  sortedDates.forEach(dateStr => {
    const isToday = dateStr === todayStr;
    const topicsInDay = dateGroups[dateStr];
    const totalDayHours = topicsInDay.reduce((acc, t) => acc + (t.estHours || 1.5), 0);
    const dayDone = topicsInDay.filter(t => t.status === 'completed').length;

    html += `
      <div class="timeline-day ${isToday ? 'today' : ''}">
        <div class="timeline-day-header">
          <div class="timeline-date-title">
            <i class="fa-regular fa-calendar" style="color: var(--primary);"></i>
            <span>${dateStr === 'Unscheduled' ? 'Backlog / Unscheduled' : formatDisplayDate(dateStr)}</span>
            ${isToday ? '<span class="timeline-today-pill">Today</span>' : ''}
          </div>
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); display: flex; gap: 1rem; align-items: center;">
            <span><i class="fa-solid fa-circle-check" style="color: var(--success);"></i> ${dayDone}/${topicsInDay.length} Completed</span>
            <span><i class="fa-regular fa-clock"></i> ~${totalDayHours.toFixed(1)} hrs</span>
          </div>
        </div>

        <div class="timeline-tasks">
    `;

    topicsInDay.forEach((topic, idx) => {
      const subject = appState.subjects.find(s => s.id === topic.subjectId) || { name: 'Subject', color: '#6366f1' };
      const isCompleted = topic.status === 'completed';

      html += `
        <div class="task-item ${isCompleted ? 'completed' : ''}">
          <div class="task-left">
            <div class="task-checkbox" onclick="toggleTopicStatus('${topic.id}')" title="Click to toggle completion">
              ${isCompleted ? '<i class="fa-solid fa-check"></i>' : ''}
            </div>
            <div class="task-details">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                ${topic.displayTime ? `<span class="time-slot-badge"><i class="fa-regular fa-clock"></i> ${topic.displayTime}</span>` : ''}
                <span class="task-title">${escapeHtml(topic.title)}</span>
              </div>
              <div class="task-meta">
                <span class="subject-badge" style="background: ${subject.color};">
                  ${escapeHtml(subject.name)}
                </span>
                <span><i class="fa-regular fa-hourglass"></i> ${topic.estHours} hrs</span>
                <span class="task-tag diff-${topic.difficulty}">${capitalize(topic.difficulty)}</span>
                ${topic.priority === 'high' ? '<span class="task-tag diff-hard" style="font-size: 0.65rem;">High Priority</span>' : ''}
                ${topic.notes ? `<span title="${escapeHtml(topic.notes)}" style="color: var(--primary); cursor: pointer;"><i class="fa-regular fa-note-sticky"></i> Note</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="startFocusWithTopic('${topic.id}')" title="Focus Timer">
              <i class="fa-solid fa-play"></i> Focus
            </button>
            <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditTopicModal('${topic.id}')" title="Edit Topic">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>
      `;

      // Insert 15-minute break slot between tasks
      if (idx < topicsInDay.length - 1 && topic.endTime) {
        const breakStart = topic.endTime;
        const breakEnd = addMinutesToTime(breakStart, 15);
        html += `
          <div class="break-slot">
            <i class="fa-solid fa-mug-hot"></i>
            <span>${formatTime12h(breakStart)} - ${formatTime12h(breakEnd)}: 15-Minute Brain Rest & Hydration Break ☕</span>
          </div>
        `;
      }
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render Weekly Calendar Grid
function changeWeeklyOffset(delta) {
  if (delta === 0) {
    currentWeeklyOffset = 0;
  } else {
    currentWeeklyOffset += delta;
  }
  renderWeeklyGrid();
}

function renderWeeklyGrid() {
  const grid = document.getElementById('weeklyGrid');
  const label = document.getElementById('weeklyGridRangeLabel');
  if (!grid) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute Monday of target week
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon + (currentWeeklyOffset * 7));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  const todayStr = today.toISOString().split('T')[0];

  if (label) {
    const startStr = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    label.textContent = `${startStr} – ${endStr} ${currentWeeklyOffset === 0 ? '(This Week)' : ''}`;
  }

  let html = '';
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  weekDays.forEach((dateObj, idx) => {
    const dStr = dateObj.toISOString().split('T')[0];
    const isToday = dStr === todayStr;
    const topicsOnDay = appState.topics.filter(t => t.scheduledDate === dStr);
    const totalHrs = topicsOnDay.reduce((acc, t) => acc + (t.estHours || 1.5), 0);

    html += `
      <div class="weekly-day-col ${isToday ? 'today' : ''}">
        <div class="weekly-col-header">
          <div class="weekly-day-name">
            <span>${dayNames[idx]}</span>
            ${isToday ? '<span class="timeline-today-pill" style="font-size: 0.65rem;">Today</span>' : ''}
          </div>
          <div class="weekly-day-date">${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ~${totalHrs.toFixed(1)}h</div>
        </div>
    `;

    if (topicsOnDay.length === 0) {
      html += `
        <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 2rem;">
          No sessions
        </div>
      `;
    } else {
      topicsOnDay.forEach(topic => {
        const sub = appState.subjects.find(s => s.id === topic.subjectId) || { name: 'Subject', color: '#6366f1' };
        const isDone = topic.status === 'completed';

        html += `
          <div class="weekly-event-card ${isDone ? 'completed' : ''}" style="border-left-color: ${sub.color};">
            <div style="font-size: 0.68rem; font-weight: 700; color: var(--primary);">
              ${topic.displayTime || `${topic.estHours} hrs`}
            </div>
            <div class="weekly-topic-title">${escapeHtml(topic.title)}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem;">
              <span class="subject-badge" style="background: ${sub.color}; font-size: 0.65rem; padding: 0.1rem 0.4rem;">
                ${escapeHtml(sub.name.slice(0, 14))}
              </span>
              <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTopicStatus('${topic.id}')" style="cursor: pointer; accent-color: var(--primary);">
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;
  });

  grid.innerHTML = html;
}

// Render Master Roadmap
function renderMasterRoadmap() {
  const container = document.getElementById('roadmapContent');
  if (!container) return;

  const exams = getSortedUpcomingExams();

  let html = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem 0;">
      <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
        Your study roadmap bridges today's preparation to each subject exam deadline. Follow the phases to build deep conceptual mastery followed by timed mock assessments.
      </div>
  `;

  // Upcoming Milestones
  html += `
    <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main);"><i class="fa-solid fa-flag-checkered"></i> Major Course Deadlines & Milestones</h4>
    <div class="grid-cards">
  `;

  exams.forEach(sub => {
    const subTopics = appState.topics.filter(t => t.subjectId === sub.id);
    const doneTopics = subTopics.filter(t => t.status === 'completed').length;
    const days = getDaysRemaining(sub.examDate);

    html += `
      <div class="card" style="border-left: 4px solid ${sub.color};">
        <div style="font-weight: 700; font-size: 1rem; color: var(--text-main);">${escapeHtml(sub.name)}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <i class="fa-regular fa-calendar"></i> Exam: ${formatDisplayDateTime(sub.examDate)} (${days} days)
        </div>
        <div class="progress-bar-bg" style="margin-bottom: 0.4rem;">
          <div class="progress-bar-fill" style="width: ${subTopics.length ? Math.round((doneTopics / subTopics.length) * 100) : 0}%; background: ${sub.color};"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
          <span>${doneTopics}/${subTopics.length} Chapters finished</span>
          <span style="font-weight: 700;">Target: ${escapeHtml(sub.targetGrade || 'A')}</span>
        </div>
      </div>
    `;
  });

  html += `
    </div>
  </div>`;

  container.innerHTML = html;
}

// ==================== EXPORT TO CALENDAR (.ICS FILE) ====================
function exportScheduleToICS() {
  const scheduledTopics = appState.topics.filter(t => t.scheduledDate && t.scheduledDate !== 'Unscheduled');

  if (scheduledTopics.length === 0) {
    showToast('No scheduled topics to export. Please generate a schedule first!', 'warning');
    return;
  }

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smart Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Smart Study Plan',
    'X-WR-TIMEZONE:UTC'
  ];

  scheduledTopics.forEach(topic => {
    const sub = appState.subjects.find(s => s.id === topic.subjectId) || { name: 'Subject' };
    const dateStr = topic.scheduledDate.replace(/-/g, '');
    const startT = (topic.startTime || '08:30').replace(':', '') + '00';
    const endT = (topic.endTime || '10:00').replace(':', '') + '00';

    const dtStart = `${dateStr}T${startT}`;
    const dtEnd = `${dateStr}T${endT}`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:topic-${topic.id}@smartstudyplanner`);
    icsContent.push(`DTSTAMP:${dateStr}T000000Z`);
    icsContent.push(`DTSTART:${dtStart}`);
    icsContent.push(`DTEND:${dtEnd}`);
    icsContent.push(`SUMMARY:[${sub.name}] ${topic.title}`);
    icsContent.push(`DESCRIPTION:Study Session for ${sub.name}\\nEstimated: ${topic.estHours} hrs\\nDifficulty: ${topic.difficulty}\\nNotes: ${topic.notes || 'None'}`);
    icsContent.push(`STATUS:${topic.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`);
    icsContent.push('END:VEVENT');
  });

  // Also export Exams as all-day events
  appState.subjects.forEach(sub => {
    const examDate = new Date(sub.examDate);
    const dateStr = examDate.toISOString().split('T')[0].replace(/-/g, '');
    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:exam-${sub.id}@smartstudyplanner`);
    icsContent.push(`DTSTAMP:${dateStr}T000000Z`);
    icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
    icsContent.push(`SUMMARY:🎯 EXAM: ${sub.name}`);
    icsContent.push(`DESCRIPTION:Final Examination for ${sub.name}. Target Grade: ${sub.targetGrade || 'A'}`);
    icsContent.push('PRIORITY:1');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smart_study_schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📅 Calendar exported! Double-click smart_study_schedule.ics to import.', 'success');
}

// ==================== SUBJECTS & TOPICS TAB ====================
function renderSubjectsTab() {
  const container = document.getElementById('subjectsCardsContainer');
  if (!container) return;

  if (appState.subjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-graduation-cap empty-state-icon"></i>
        <div class="empty-state-title">No subjects added yet</div>
        <p class="empty-state-desc">Create your subjects and set exam dates to begin your smart study journey.</p>
        <button class="btn btn-primary" onclick="openAddSubjectModal()">+ Add Subject</button>
      </div>
    `;
    return;
  }

  let html = '';
  appState.subjects.forEach(subject => {
    const subTopics = appState.topics.filter(t => t.subjectId === subject.id);
    const totalCount = subTopics.length;
    const completedCount = subTopics.filter(t => t.status === 'completed').length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const daysLeft = getDaysRemaining(subject.examDate);

    html += `
      <div class="subject-card">
        <div class="subject-card-bar" style="background: ${subject.color};"></div>
        <div class="subject-header">
          <div>
            <h3 class="subject-name">${escapeHtml(subject.name)}</h3>
            <div class="subject-exam-date">
              <i class="fa-solid fa-calendar-day"></i> Exam Date: ${formatDisplayDateTime(subject.examDate)}
            </div>
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditSubjectModal('${subject.id}')" title="Edit Subject">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-secondary btn-icon btn-sm" style="color: var(--danger);" onclick="deleteSubject('${subject.id}')" title="Delete Subject">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
            <span>${completedCount} / ${totalCount} Topics (${percent}%)</span>
            <span style="font-weight: 700; color: ${daysLeft <= 3 ? 'var(--danger)' : 'var(--text-secondary)'};">
              ${daysLeft >= 0 ? `${daysLeft} days until exam` : 'Exam concluded'}
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%; background: ${subject.color};"></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
          <strong style="font-size: 0.85rem; color: var(--text-main);">Chapters & Topics:</strong>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-sm" onclick="openTopicModalForSubject('${subject.id}')">
              <i class="fa-solid fa-plus"></i> Topic
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openBulkTopicsModal('${subject.id}')" title="Paste multiple topics">
              <i class="fa-solid fa-file-import"></i> Bulk
            </button>
          </div>
        </div>

        <div class="topic-list-container">
    `;

    if (subTopics.length === 0) {
      html += `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1.5rem 0;">
          No topics added yet. Click "+ Topic" or "Bulk" above.
        </div>
      `;
    } else {
      subTopics.forEach(topic => {
        const isDone = topic.status === 'completed';
        html += `
          <div class="topic-row">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0;">
              <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTopicStatus('${topic.id}')" style="cursor: pointer; accent-color: var(--primary);">
              <span style="font-weight: 500; ${isDone ? 'text-decoration: line-through; color: var(--text-muted);' : ''} overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(topic.title)}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.35rem; margin-left: 0.5rem;">
              <span class="task-tag diff-${topic.difficulty}" style="font-size: 0.65rem;">${topic.estHours}h</span>
              <button class="btn btn-secondary btn-icon btn-sm" style="width: 24px; height: 24px; font-size: 0.7rem;" onclick="openEditTopicModal('${topic.id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-secondary btn-icon btn-sm" style="width: 24px; height: 24px; font-size: 0.7rem; color: var(--danger);" onclick="deleteTopic('${topic.id}')">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Populate dropdowns
function populateDropdowns() {
  const topicSubSelect = document.getElementById('topicSubjectSelect');
  if (topicSubSelect) {
    topicSubSelect.innerHTML = appState.subjects.map(s => `
      <option value="${s.id}">${escapeHtml(s.name)}</option>
    `).join('');
  }

  const bulkSubSelect = document.getElementById('bulkSubjectSelect');
  if (bulkSubSelect) {
    bulkSubSelect.innerHTML = appState.subjects.map(s => `
      <option value="${s.id}">${escapeHtml(s.name)}</option>
    `).join('');
  }

  const schedFilter = document.getElementById('scheduleSubjectFilter');
  if (schedFilter) {
    const curVal = schedFilter.value || 'all';
    schedFilter.innerHTML = '<option value="all">All Subjects</option>' + appState.subjects.map(s => `
      <option value="${s.id}" ${curVal === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>
    `).join('');
  }

  const timerSelect = document.getElementById('timerTopicSelect');
  if (timerSelect) {
    const curVal = timerSelect.value;
    let opts = '<option value="">-- General Study Session --</option>';
    appState.topics.forEach(t => {
      const sub = appState.subjects.find(s => s.id === t.subjectId);
      const subName = sub ? sub.name : 'Unknown';
      const isDone = t.status === 'completed' ? ' [✓ Done]' : '';
      opts += `<option value="${t.id}" ${curVal === t.id ? 'selected' : ''}>[${escapeHtml(subName)}] ${escapeHtml(t.title)}${isDone}</option>`;
    });
    timerSelect.innerHTML = opts;
  }
}

// ==================== TOPIC ACTIONS & PROGRESS TRACKING ====================
function toggleTopicStatus(topicId) {
  const topic = appState.topics.find(t => t.id === topicId);
  if (!topic) return;

  if (topic.status === 'completed') {
    topic.status = 'not_started';
    topic.completedAt = null;
    showToast(`"${topic.title}" marked as pending`, 'info');
  } else {
    topic.status = 'completed';
    topic.completedAt = new Date().toISOString();

    triggerCelebration();
    playCompletionSound();
    showToast(`🎉 "${topic.title}" completed!`, 'success');
    updateStudyStreak();
  }

  saveState();
  renderAll();
}

function updateStudyStreak() {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = appState.streak.lastStudyDate;

  if (lastDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      appState.streak.count = (appState.streak.count || 0) + 1;
    } else {
      appState.streak.count = 1;
    }
    appState.streak.lastStudyDate = todayStr;
  }
}

function triggerCelebration() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.75 }
    });
  }
}

function playCompletionSound() {
  if (!appState.settings.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {}
}

// ==================== SUBJECT CRUD ====================
function openAddSubjectModal() {
  document.getElementById('modalSubjectTitle').textContent = 'Add New Subject';
  document.getElementById('subjectId').value = '';
  document.getElementById('subjectName').value = '';
  
  const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  document.getElementById('subjectExamDate').value = future.toISOString().slice(0, 16);
  document.getElementById('subjectTargetGrade').value = 'A';
  document.getElementById('subjectInitialTopics').value = '';
  document.getElementById('subjectColor').value = '#6366f1';

  selectColorSwatch('#6366f1');
  openModal('modalSubject');
}

function openEditSubjectModal(subjectId) {
  const subject = appState.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  document.getElementById('modalSubjectTitle').textContent = 'Edit Subject';
  document.getElementById('subjectId').value = subject.id;
  document.getElementById('subjectName').value = subject.name;
  document.getElementById('subjectExamDate').value = subject.examDate ? subject.examDate.slice(0, 16) : '';
  document.getElementById('subjectTargetGrade').value = subject.targetGrade || '';
  document.getElementById('subjectInitialTopics').value = '';
  document.getElementById('subjectColor').value = subject.color || '#6366f1';

  selectColorSwatch(subject.color || '#6366f1');
  openModal('modalSubject');
}

function selectColorSwatch(color) {
  document.querySelectorAll('.color-swatch').forEach(s => {
    if (s.getAttribute('data-color') === color) {
      s.classList.add('selected');
    } else {
      s.classList.remove('selected');
    }
  });
}

function handleSubjectFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('subjectId').value;
  const name = document.getElementById('subjectName').value.trim();
  const examDate = document.getElementById('subjectExamDate').value;
  const targetGrade = document.getElementById('subjectTargetGrade').value.trim();
  const color = document.getElementById('subjectColor').value || '#6366f1';
  const initialTopicsText = document.getElementById('subjectInitialTopics').value.trim();

  if (!name || !examDate) {
    showToast('Subject name and exam date are required!', 'danger');
    return;
  }

  if (id) {
    const existing = appState.subjects.find(s => s.id === id);
    if (existing) {
      existing.name = name;
      existing.examDate = examDate;
      existing.targetGrade = targetGrade;
      existing.color = color;
      showToast(`Subject "${name}" updated!`, 'success');
    }
  } else {
    const newId = 'sub_' + Date.now();
    const newSubject = {
      id: newId,
      name,
      examDate,
      targetGrade,
      color,
      createdAt: new Date().toISOString()
    };
    appState.subjects.push(newSubject);

    if (initialTopicsText) {
      const lines = initialTopicsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      lines.forEach(line => {
        appState.topics.push({
          id: 'top_' + Math.random().toString(36).substr(2, 9),
          subjectId: newId,
          title: line,
          estHours: 1.5,
          difficulty: 'medium',
          priority: 'normal',
          status: 'not_started',
          notes: '',
          scheduledDate: null,
          displayTime: '',
          startTime: '',
          endTime: '',
          completedAt: null,
          actualMinutes: 0
        });
      });
    }

    showToast(`Subject "${name}" added!`, 'success');
  }

  saveState();
  closeModal('modalSubject');
  smartGenerateSchedule(false);
  renderAll();
}

function deleteSubject(subjectId) {
  const subject = appState.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  if (!confirm(`Are you sure you want to delete "${subject.name}" and all its topics?`)) {
    return;
  }

  appState.subjects = appState.subjects.filter(s => s.id !== subjectId);
  appState.topics = appState.topics.filter(t => t.subjectId !== subjectId);

  saveState();
  renderAll();
  showToast(`Subject "${subject.name}" deleted`, 'info');
}

// ==================== TOPIC CRUD ====================
function openTopicModalForSubject(subjectId) {
  openAddTopicModal();
  const select = document.getElementById('topicSubjectSelect');
  if (select && subjectId) select.value = subjectId;
}

function openAddTopicModal() {
  document.getElementById('modalTopicTitle').textContent = 'Add New Topic';
  document.getElementById('topicId').value = '';
  document.getElementById('topicTitle').value = '';
  document.getElementById('topicEstHours').value = '1.5';
  document.getElementById('topicDifficulty').value = 'medium';
  document.getElementById('topicPriority').value = 'normal';
  document.getElementById('topicStatus').value = 'not_started';
  document.getElementById('topicNotes').value = '';

  populateDropdowns();
  openModal('modalTopic');
}

function openEditTopicModal(topicId) {
  const topic = appState.topics.find(t => t.id === topicId);
  if (!topic) return;

  document.getElementById('modalTopicTitle').textContent = 'Edit Topic';
  document.getElementById('topicId').value = topic.id;
  document.getElementById('topicTitle').value = topic.title;
  document.getElementById('topicEstHours').value = topic.estHours || 1.5;
  document.getElementById('topicDifficulty').value = topic.difficulty || 'medium';
  document.getElementById('topicPriority').value = topic.priority || 'normal';
  document.getElementById('topicStatus').value = topic.status || 'not_started';
  document.getElementById('topicNotes').value = topic.notes || '';

  populateDropdowns();
  const select = document.getElementById('topicSubjectSelect');
  if (select) select.value = topic.subjectId;

  openModal('modalTopic');
}

function handleTopicFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('topicId').value;
  const subjectId = document.getElementById('topicSubjectSelect').value;
  const title = document.getElementById('topicTitle').value.trim();
  const estHours = parseFloat(document.getElementById('topicEstHours').value) || 1.5;
  const difficulty = document.getElementById('topicDifficulty').value;
  const priority = document.getElementById('topicPriority').value;
  const status = document.getElementById('topicStatus').value;
  const notes = document.getElementById('topicNotes').value.trim();

  if (!title || !subjectId) {
    showToast('Topic title and subject are required!', 'danger');
    return;
  }

  if (id) {
    const topic = appState.topics.find(t => t.id === id);
    if (topic) {
      topic.subjectId = subjectId;
      topic.title = title;
      topic.estHours = estHours;
      topic.difficulty = difficulty;
      topic.priority = priority;
      topic.status = status;
      topic.notes = notes;
      if (status === 'completed' && !topic.completedAt) {
        topic.completedAt = new Date().toISOString();
      } else if (status !== 'completed') {
        topic.completedAt = null;
      }
      showToast('Topic updated!', 'success');
    }
  } else {
    const newTopic = {
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId,
      title,
      estHours,
      difficulty,
      priority,
      status,
      notes,
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: status === 'completed' ? new Date().toISOString() : null,
      actualMinutes: 0
    };
    appState.topics.push(newTopic);
    showToast('New topic added!', 'success');
  }

  saveState();
  closeModal('modalTopic');
  smartGenerateSchedule(false);
  renderAll();
}

function deleteTopic(topicId) {
  const topic = appState.topics.find(t => t.id === topicId);
  if (!topic) return;

  appState.topics = appState.topics.filter(t => t.id !== topicId);
  saveState();
  renderAll();
  showToast(`Topic removed`, 'info');
}

// ==================== BULK TOPICS IMPORT ====================
function openBulkTopicsModal(subjectId = null) {
  populateDropdowns();
  const select = document.getElementById('bulkSubjectSelect');
  if (select && subjectId) select.value = subjectId;
  document.getElementById('bulkTopicsText').value = '';
  openModal('modalBulkTopics');
}

function handleBulkTopicsSubmit(e) {
  e.preventDefault();
  const subjectId = document.getElementById('bulkSubjectSelect').value;
  const text = document.getElementById('bulkTopicsText').value.trim();
  const defaultHours = parseFloat(document.getElementById('bulkDefaultHours').value) || 1.5;
  const defaultDiff = document.getElementById('bulkDefaultDiff').value || 'medium';

  if (!subjectId || !text) {
    showToast('Please select a subject and enter topics', 'danger');
    return;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    showToast('No topics found to import', 'warning');
    return;
  }

  lines.forEach(line => {
    appState.topics.push({
      id: 'top_' + Math.random().toString(36).substr(2, 9),
      subjectId,
      title: line,
      estHours: defaultHours,
      difficulty: defaultDiff,
      priority: 'normal',
      status: 'not_started',
      notes: '',
      scheduledDate: null,
      displayTime: '',
      startTime: '',
      endTime: '',
      completedAt: null,
      actualMinutes: 0
    });
  });

  saveState();
  closeModal('modalBulkTopics');
  smartGenerateSchedule(false);
  renderAll();
  showToast(`Successfully imported ${lines.length} topics!`, 'success');
}

// ==================== FOCUS TIMER (POMODORO) ====================
let timerInterval = null;
let timerSecondsRemaining = 25 * 60;
let timerTotalSeconds = 25 * 60;
let isTimerRunning = false;
let currentTimerMode = 'pomodoro';
let activeTimerTopicId = null;

const timerDurations = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  deepWork: 50 * 60
};

function initTimer() {
  const toggleBtn = document.getElementById('btnTimerToggle');
  const resetBtn = document.getElementById('btnTimerReset');
  const soundBtn = document.getElementById('btnTimerSound');
  const modeBtns = document.querySelectorAll('.timer-mode-btn');
  const topicSelect = document.getElementById('timerTopicSelect');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTimerMode(btn.getAttribute('data-mode'));
    });
  });

  if (toggleBtn) toggleBtn.addEventListener('click', toggleTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      appState.settings.soundEnabled = !appState.settings.soundEnabled;
      soundBtn.innerHTML = appState.settings.soundEnabled
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-xmark"></i>';
      showToast(appState.settings.soundEnabled ? 'Timer sound enabled' : 'Timer sound muted', 'info');
      saveState();
    });
  }

  if (topicSelect) {
    topicSelect.addEventListener('change', () => {
      activeTimerTopicId = topicSelect.value || null;
      updateTimerTopicPill();
    });
  }
}

function setTimerMode(mode) {
  pauseTimer();
  currentTimerMode = mode;
  timerSecondsRemaining = timerDurations[mode] || (25 * 60);
  timerTotalSeconds = timerSecondsRemaining;
  updateTimerDisplay();
}

function toggleTimer() {
  if (isTimerRunning) pauseTimer();
  else startTimer();
}

function startTimer() {
  isTimerRunning = true;
  const toggleIcon = document.getElementById('timerIcon');
  if (toggleIcon) toggleIcon.className = 'fa-solid fa-pause';

  timerInterval = setInterval(() => {
    timerSecondsRemaining--;
    updateTimerDisplay();

    if (timerSecondsRemaining <= 0) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      onTimerCompleted();
    }
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  clearInterval(timerInterval);
  const toggleIcon = document.getElementById('timerIcon');
  if (toggleIcon) toggleIcon.className = 'fa-solid fa-play';
}

function resetTimer() {
  pauseTimer();
  timerSecondsRemaining = timerDurations[currentTimerMode];
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;

  const minutes = Math.floor(timerSecondsRemaining / 60);
  const seconds = timerSecondsRemaining % 60;
  display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerTopicPill() {
  const pill = document.getElementById('timerCurrentTopicName');
  if (!pill) return;

  if (activeTimerTopicId) {
    const topic = appState.topics.find(t => t.id === activeTimerTopicId);
    pill.textContent = topic ? topic.title : 'General Study Session';
  } else {
    pill.textContent = 'General Study Session';
  }
}

function onTimerCompleted() {
  playCompletionSound();
  triggerCelebration();

  const elapsedMinutes = Math.round(timerTotalSeconds / 60);
  appState.studyLogs.push({
    id: 'log_' + Date.now(),
    topicId: activeTimerTopicId,
    durationMinutes: elapsedMinutes,
    timestamp: new Date().toISOString()
  });

  if (activeTimerTopicId) {
    const topic = appState.topics.find(t => t.id === activeTimerTopicId);
    if (topic) {
      topic.actualMinutes = (topic.actualMinutes || 0) + elapsedMinutes;
    }
  }

  updateTimerStats();
  saveState();
  renderAll();

  showToast(`🎉 Focus session completed! (${elapsedMinutes} min logged)`, 'success');
  resetTimer();
}

function updateTimerStats() {
  const countEl = document.getElementById('pomodoroCompletedCount');
  const minEl = document.getElementById('pomodoroMinutesTotal');

  const totalLogs = appState.studyLogs.length;
  const totalMins = appState.studyLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  if (countEl) countEl.textContent = totalLogs;
  if (minEl) minEl.textContent = `${totalMins} min`;
}

function startFocusWithTopic(topicId) {
  switchTab('timer');
  activeTimerTopicId = topicId;
  const topicSelect = document.getElementById('timerTopicSelect');
  if (topicSelect) topicSelect.value = topicId;
  updateTimerTopicPill();
  setTimerMode('pomodoro');
  startTimer();
}

// ==================== ANALYTICS & CHARTS (CHART.JS) ====================
let chartProgressInstance = null;
let chartStatusInstance = null;
let chartHoursInstance = null;

function updateAnalyticsCharts() {
  updateSubjectProgressChart();
  updateTopicStatusChart();
  updateStudyHoursChart();
}

function updateSubjectProgressChart() {
  const ctx = document.getElementById('chartSubjectProgress');
  if (!ctx || typeof Chart === 'undefined') return;

  const labels = appState.subjects.map(s => s.name);
  const data = appState.subjects.map(s => {
    const subTopics = appState.topics.filter(t => t.subjectId === s.id);
    const completed = subTopics.filter(t => t.status === 'completed').length;
    return subTopics.length > 0 ? Math.round((completed / subTopics.length) * 100) : 0;
  });
  const colors = appState.subjects.map(s => s.color || '#6366f1');

  if (chartProgressInstance) chartProgressInstance.destroy();

  chartProgressInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data,
        backgroundColor: colors,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => `${v}%` }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function updateTopicStatusChart() {
  const ctx = document.getElementById('chartTopicStatus');
  if (!ctx || typeof Chart === 'undefined') return;

  const notStarted = appState.topics.filter(t => t.status === 'not_started').length;
  const inProgress = appState.topics.filter(t => t.status === 'in_progress').length;
  const completed = appState.topics.filter(t => t.status === 'completed').length;
  const needsRevision = appState.topics.filter(t => t.status === 'needs_revision').length;

  if (chartStatusInstance) chartStatusInstance.destroy();

  chartStatusInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Not Started', 'In Progress', 'Completed', 'Needs Revision'],
      datasets: [{
        data: [notStarted, inProgress, completed, needsRevision],
        backgroundColor: ['#94a3b8', '#f59e0b', '#10b981', '#a855f7'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function updateStudyHoursChart() {
  const ctx = document.getElementById('chartStudyHours');
  if (!ctx || typeof Chart === 'undefined') return;

  const labels = appState.subjects.map(s => s.name);
  const estHoursData = appState.subjects.map(s => {
    const subTopics = appState.topics.filter(t => t.subjectId === s.id);
    return subTopics.reduce((acc, t) => acc + (t.estHours || 1.5), 0);
  });
  const actualHoursData = appState.subjects.map(s => {
    const subTopics = appState.topics.filter(t => t.subjectId === s.id);
    const mins = subTopics.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);
    return parseFloat((mins / 60).toFixed(1));
  });

  if (chartHoursInstance) chartHoursInstance.destroy();

  chartHoursInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Estimated Required Hours',
          data: estHoursData,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderRadius: 6
        },
        {
          label: 'Logged Focus Hours',
          data: actualHoursData,
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Hours' }
        }
      }
    }
  });
}

// ==================== SETTINGS & MODALS ====================
function openSettingsModal() {
  document.getElementById('settingDailyHours').value = appState.settings.dailyHours || 3.5;
  document.getElementById('settingSessionLength').value = appState.settings.sessionLength || 45;
  document.getElementById('settingRevisionBuffer').value = appState.settings.revisionBufferDays || 2;

  const days = appState.settings.studyDays || [1, 2, 3, 4, 5, 6];
  document.getElementById('dayMon').checked = days.includes(1);
  document.getElementById('dayTue').checked = days.includes(2);
  document.getElementById('dayWed').checked = days.includes(3);
  document.getElementById('dayThu').checked = days.includes(4);
  document.getElementById('dayFri').checked = days.includes(5);
  document.getElementById('daySat').checked = days.includes(6);
  document.getElementById('daySun').checked = days.includes(0);

  openModal('modalSettings');
}

function handleSettingsSubmit(e) {
  e.preventDefault();
  const dailyHours = parseFloat(document.getElementById('settingDailyHours').value) || 3.5;
  const sessionLength = parseInt(document.getElementById('settingSessionLength').value) || 45;
  const revisionBuffer = parseInt(document.getElementById('settingRevisionBuffer').value) || 2;

  const studyDays = [];
  if (document.getElementById('dayMon').checked) studyDays.push(1);
  if (document.getElementById('dayTue').checked) studyDays.push(2);
  if (document.getElementById('dayWed').checked) studyDays.push(3);
  if (document.getElementById('dayThu').checked) studyDays.push(4);
  if (document.getElementById('dayFri').checked) studyDays.push(5);
  if (document.getElementById('daySat').checked) studyDays.push(6);
  if (document.getElementById('daySun').checked) studyDays.push(0);

  appState.settings.dailyHours = dailyHours;
  appState.settings.sessionLength = sessionLength;
  appState.settings.revisionBufferDays = revisionBuffer;
  appState.settings.studyDays = studyDays;

  saveState();
  closeModal('modalSettings');
  showToast('Settings saved! Re-optimizing schedule...', 'success');
  smartGenerateSchedule(false);
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

window.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

function switchTab(tabId) {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === `tab-${tabId}`) pane.classList.add('active');
    else pane.classList.remove('active');
  });

  if (tabId === 'analytics') {
    setTimeout(updateAnalyticsCharts, 100);
  }
  if (tabId === 'schedule') {
    renderDailySchedule();
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  appState.settings.theme = newTheme;

  const btnIcon = document.getElementById('btnToggleTheme');
  if (btnIcon) {
    btnIcon.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  saveState();
  if (chartProgressInstance) updateAnalyticsCharts();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'fa-circle-info';
  let color = 'var(--info)';
  if (type === 'success') {
    icon = 'fa-circle-check';
    color = 'var(--success)';
  } else if (type === 'warning') {
    icon = 'fa-triangle-exclamation';
    color = 'var(--warning)';
  } else if (type === 'danger') {
    icon = 'fa-circle-xmark';
    color = 'var(--danger)';
  }

  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: ${color}; font-size: 1.1rem;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== AUTHENTICATION & LOGIN ANIMATION ====================

function initAuthUI() {
  const isLoggedIn = sessionStorage.getItem('study_logged_in');
  if (!isLoggedIn) {
    // Redirect unauthenticated visitors to dedicated Login portal
    window.location.replace('login.html');
    return;
  }

  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');

  if (authScreen) authScreen.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';
  updateUserProfileNav();
}

function updateUserProfileNav() {
  const user = appState.currentUser;
  if (!user) return;

  const initials = getInitials(user.name);
  const navAvatar = document.getElementById('navUserAvatar');
  const navName = document.getElementById('navUserName');
  const dropName = document.getElementById('dropdownFullName');
  const dropEmail = document.getElementById('dropdownEmail');
  const dropGoal = document.getElementById('dropdownGoal');

  if (navAvatar) navAvatar.textContent = initials;
  if (navName) navName.textContent = user.name.split(' ')[0] || user.name;
  if (dropName) dropName.textContent = user.name;
  if (dropEmail) dropEmail.textContent = user.email;
  if (dropGoal) dropGoal.textContent = user.targetExam || 'General Study';
}

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function switchAuthTab(tab) {
  const formSignIn = document.getElementById('formSignIn');
  const formSignUp = document.getElementById('formSignUp');
  const btnTabSignIn = document.getElementById('btnAuthTabSignIn');
  const btnTabSignUp = document.getElementById('btnAuthTabSignUp');
  const alertBanner = document.getElementById('authAlertBanner');

  if (alertBanner) alertBanner.style.display = 'none';

  if (tab === 'signin') {
    if (formSignIn) formSignIn.style.display = 'block';
    if (formSignUp) formSignUp.style.display = 'none';
    if (btnTabSignIn) btnTabSignIn.classList.add('active');
    if (btnTabSignUp) btnTabSignUp.classList.remove('active');
  } else {
    if (formSignIn) formSignIn.style.display = 'none';
    if (formSignUp) formSignUp.style.display = 'block';
    if (btnTabSignIn) btnTabSignIn.classList.remove('active');
    if (btnTabSignUp) btnTabSignUp.classList.add('active');
  }
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  const icon = btnEl.querySelector('i');
  if (icon) {
    icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  }
}

function checkPasswordStrength(password) {
  const bar1 = document.getElementById('strengthBar1');
  const bar2 = document.getElementById('strengthBar2');
  const bar3 = document.getElementById('strengthBar3');
  const text = document.getElementById('strengthText');

  if (!bar1 || !bar2 || !bar3 || !text) return;

  bar1.style.background = 'var(--border-light)';
  bar2.style.background = 'var(--border-light)';
  bar3.style.background = 'var(--border-light)';

  if (!password) {
    text.textContent = 'Strength: min 6 chars';
    text.style.color = 'var(--text-muted)';
    return;
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8 && /[0-9]/.test(password)) score++;
  if (password.length >= 10 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  if (score === 1) {
    bar1.style.background = '#ef4444';
    text.textContent = 'Weak password';
    text.style.color = '#ef4444';
  } else if (score === 2) {
    bar1.style.background = '#f59e0b';
    bar2.style.background = '#f59e0b';
    text.textContent = 'Good password';
    text.style.color = '#f59e0b';
  } else {
    bar1.style.background = '#10b981';
    bar2.style.background = '#10b981';
    bar3.style.background = '#10b981';
    text.textContent = 'Strong password 💪';
    text.style.color = '#10b981';
  }
}

function showAuthAlert(message, type = 'error') {
  const alertBanner = document.getElementById('authAlertBanner');
  if (!alertBanner) return;

  alertBanner.style.display = 'block';
  if (type === 'error') {
    alertBanner.style.background = 'rgba(239, 68, 68, 0.12)';
    alertBanner.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    alertBanner.style.color = '#dc2626';
    alertBanner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(message)}`;
  } else {
    alertBanner.style.background = 'rgba(16, 185, 129, 0.12)';
    alertBanner.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    alertBanner.style.color = '#059669';
    alertBanner.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(message)}`;
  }
}

function handleSignInSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value.trim().toLowerCase();
  const password = document.getElementById('signinPassword').value;

  const user = appState.users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (user) {
    triggerLoginSuccessAnimation(user);
  } else {
    // Also allow demo fallback if matched
    if (email === 'alex@study.io' && (password === 'password123' || password === '••••••••')) {
      const demo = defaultUsers[0];
      triggerLoginSuccessAnimation(demo);
    } else {
      showAuthAlert('Invalid email or password. You can also use the 1-Click Demo Sign In button below!', 'error');
    }
  }
}

function handleSignUpSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const targetExam = document.getElementById('signupGoal').value;

  if (!name || !email || !password) {
    showAuthAlert('Please fill in all required fields.', 'error');
    return;
  }

  const existing = appState.users.find(u => u.email.toLowerCase() === email);
  if (existing) {
    showAuthAlert('An account with this email already exists! Please click Sign In.', 'error');
    return;
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name,
    email,
    password,
    targetExam,
    avatar: getInitials(name),
    createdAt: new Date().toISOString()
  };

  appState.users.push(newUser);
  saveState();
  triggerLoginSuccessAnimation(newUser);
}

function handleDemoLogin() {
  const demoUser = appState.users.find(u => u.email === 'alex@study.io') || defaultUsers[0];
  const emailInput = document.getElementById('signinEmail');
  const pwdInput = document.getElementById('signinPassword');
  if (emailInput) emailInput.value = demoUser.email;
  if (pwdInput) pwdInput.value = demoUser.password;

  triggerLoginSuccessAnimation(demoUser);
}

function handleGoogleMockLogin() {
  const googleUser = {
    id: 'user_google_' + Date.now(),
    name: 'Alex Chen',
    email: 'alex.chen@gmail.com',
    targetExam: 'University Semester Finals',
    avatar: 'G',
    createdAt: new Date().toISOString()
  };
  if (!appState.users.some(u => u.email === googleUser.email)) {
    appState.users.push(googleUser);
    saveState();
  }
  triggerLoginSuccessAnimation(googleUser);
}

// ==================== CINEMATIC POST-LOGIN ANIMATION ====================
function triggerLoginSuccessAnimation(user) {
  const overlay = document.getElementById('loginSuccessOverlay');
  const heading = document.getElementById('loginSuccessHeading');
  const message = document.getElementById('loginSuccessMessage');
  const loaderBar = document.getElementById('loginLoaderBar');
  const loaderStatus = document.getElementById('loginLoaderStatus');

  // Play uplifting chord chime
  playWelcomeChime();

  if (heading) heading.textContent = `Welcome, ${user.name}! 🎓`;
  if (message) message.textContent = `Preparing your personalized study workspace for ${user.targetExam || 'upcoming exams'}...`;
  if (loaderBar) loaderBar.style.width = '0%';
  if (loaderStatus) loaderStatus.textContent = 'Verifying student credentials...';

  // Activate overlay
  if (overlay) {
    overlay.classList.add('active');
  }

  // Confetti burst
  triggerCelebration();

  // Progress animation sequence
  setTimeout(() => {
    if (loaderBar) loaderBar.style.width = '35%';
    if (loaderStatus) loaderStatus.textContent = 'Loading subjects & chapter syllabi...';
  }, 250);

  setTimeout(() => {
    if (loaderBar) loaderBar.style.width = '70%';
    if (loaderStatus) loaderStatus.textContent = 'Calibrating daily timetables & revision buffers...';
  }, 650);

  setTimeout(() => {
    if (loaderBar) loaderBar.style.width = '100%';
    if (loaderStatus) loaderStatus.textContent = '✨ Setup complete! Launching study dashboard...';
    triggerCelebration();
  }, 1150);

  setTimeout(() => {
    if (overlay) {
      overlay.style.opacity = '0';
    }

    setTimeout(() => {
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.opacity = '1';
      }

      // Finish login transition
      appState.currentUser = user;
      saveState();
      sessionStorage.setItem('study_logged_in', 'true');

      const authScreen = document.getElementById('authScreen');
      const appContainer = document.getElementById('appContainer');

      if (authScreen) authScreen.style.display = 'none';
      if (appContainer) {
        appContainer.style.display = 'flex';
        appContainer.style.animation = 'fadeIn 0.4s ease';
      }

      updateUserProfileNav();
      renderAll();
      showToast(`Welcome, ${user.name}! Ready to study? 🚀`, 'success');
    }, 350);
  }, 1600);
}

function playWelcomeChime() {
  if (!appState.settings.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.35);
    });
  } catch (e) {}
}

function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  const card = document.getElementById('userDropdownCard');
  if (card) card.classList.toggle('active');
}

function closeUserDropdown() {
  const card = document.getElementById('userDropdownCard');
  if (card) card.classList.remove('active');
}

window.addEventListener('click', (e) => {
  if (!e.target.closest('.user-profile-menu')) {
    closeUserDropdown();
  }
});

function handleLogout() {
  closeUserDropdown();
  appState.currentUser = null;
  saveState();
  sessionStorage.removeItem('study_logged_in');
  window.location.href = 'login.html';
}

// ==================== EVENT LISTENERS INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initAuthUI();

  if (appState.settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btnIcon = document.getElementById('btnToggleTheme');
    if (btnIcon) btnIcon.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  // Nav tabs
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Top action buttons: Now opens the full Plan Generator Wizard!
  document.getElementById('btnGenerateSchedule')?.addEventListener('click', openPlanGeneratorModal);
  document.getElementById('btnRebalanceToday')?.addEventListener('click', () => smartGenerateSchedule(true));
  document.getElementById('btnRebalanceFull')?.addEventListener('click', () => smartGenerateSchedule(true));
  document.getElementById('btnOpenAddSubject')?.addEventListener('click', openAddSubjectModal);
  document.getElementById('btnSettings')?.addEventListener('click', openSettingsModal);
  document.getElementById('btnToggleTheme')?.addEventListener('click', toggleTheme);
  document.getElementById('btnQuickPomodoro')?.addEventListener('click', () => switchTab('timer'));
  document.getElementById('btnPrintSchedule')?.addEventListener('click', () => window.print());
  document.getElementById('btnExportICS')?.addEventListener('click', exportScheduleToICS);

  // Schedule subject filter
  document.getElementById('scheduleSubjectFilter')?.addEventListener('change', renderDailySchedule);

  // Forms
  document.getElementById('formSubject')?.addEventListener('submit', handleSubjectFormSubmit);
  document.getElementById('formTopic')?.addEventListener('submit', handleTopicFormSubmit);
  document.getElementById('formBulkTopics')?.addEventListener('submit', handleBulkTopicsSubmit);
  document.getElementById('formSettings')?.addEventListener('submit', handleSettingsSubmit);
  document.getElementById('formPlanGenerator')?.addEventListener('submit', handlePlanGeneratorSubmit);

  // Plan Generator Intensity Card Selection
  document.querySelectorAll('#planIntensityOptions .intensity-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#planIntensityOptions .intensity-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const hours = card.getAttribute('data-hours');
      document.getElementById('planDailyHoursInput').value = hours;
      updatePlanProjection();
    });
  });

  // Plan Generator Time Window Card Selection
  document.querySelectorAll('#planTimeWindowOptions .timeslot-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#planTimeWindowOptions .timeslot-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const start = card.getAttribute('data-start');
      document.getElementById('planStartTimeInput').value = start;
    });
  });

  // Buffer change triggers projection update
  document.getElementById('planRevisionBuffer')?.addEventListener('change', updatePlanProjection);

  // Demo & Reset buttons in Settings
  document.getElementById('btnLoadDemoData')?.addEventListener('click', () => {
    if (confirm('Load sample subjects, exams, and topics?')) {
      appState = generateDemoData();
      saveState();
      smartGenerateSchedule(false);
      renderAll();
      closeModal('modalSettings');
      showToast('Sample study data loaded!', 'success');
    }
  });

  document.getElementById('btnResetAllData')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL subjects, topics, and progress?')) {
      appState = {
        subjects: [],
        topics: [],
        settings: { ...defaultSettings },
        studyLogs: [],
        activePlan: null,
        streak: { count: 1, lastStudyDate: new Date().toISOString().split('T')[0] }
      };
      saveState();
      renderAll();
      closeModal('modalSettings');
      showToast('All planner data reset', 'info');
    }
  });

  // Color Swatch Selection
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      const color = swatch.getAttribute('data-color');
      document.getElementById('subjectColor').value = color;
    });
  });

  // Init Timer
  initTimer();
  updateTimerStats();

  // Initial Render
  renderAll();
});
