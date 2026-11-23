#!/usr/bin/env python3
"""
Smart Study Planner - Terminal CLI Companion
Allows managing subjects, exam dates, generating schedules, and tracking progress from the command line.
"""

import sys
import json
import os
from datetime import datetime, date, timedelta

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "planner_data.json")

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "subjects": [
            {
                "id": "sub_1",
                "name": "Calculus & Linear Algebra",
                "examDate": (date.today() + timedelta(days=12)).isoformat(),
                "color": "#6366f1"
            },
            {
                "id": "sub_2",
                "name": "Organic Chemistry",
                "examDate": (date.today() + timedelta(days=20)).isoformat(),
                "color": "#06b6d4"
            }
        ],
        "topics": [
            {"id": "top_1", "subjectId": "sub_1", "title": "Limits & Continuity", "estHours": 1.5, "completed": True, "scheduledDate": date.today().isoformat()},
            {"id": "top_2", "subjectId": "sub_1", "title": "Derivatives & Chain Rule", "estHours": 2.0, "completed": True, "scheduledDate": date.today().isoformat()},
            {"id": "top_3", "subjectId": "sub_1", "title": "Integration by Parts", "estHours": 2.5, "completed": False, "scheduledDate": date.today().isoformat()},
            {"id": "top_4", "subjectId": "sub_1", "title": "Eigenvalues & Matrices", "estHours": 2.0, "completed": False, "scheduledDate": (date.today() + timedelta(days=1)).isoformat()},
            {"id": "top_5", "subjectId": "sub_2", "title": "Aromatic Substitution", "estHours": 2.0, "completed": False, "scheduledDate": (date.today() + timedelta(days=1)).isoformat()},
            {"id": "top_6", "subjectId": "sub_2", "title": "NMR Spectroscopy", "estHours": 3.0, "completed": False, "scheduledDate": (date.today() + timedelta(days=2)).isoformat()}
        ],
        "dailyHours": 3.5
    }

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def print_header(title):
    print("\n" + "=" * 55)
    print(f" 🎓 {title}")
    print("=" * 55)

def cmd_progress():
    data = load_data()
    subjects = data.get("subjects", [])
    topics = data.get("topics", [])

    total_topics = len(topics)
    completed_topics = sum(1 for t in topics if t.get("completed", False))
    overall_pct = int((completed_topics / total_topics) * 100) if total_topics > 0 else 0

    print_header("STUDY PROGRESS OVERVIEW")
    print(f"Overall Completion: [{'#' * (overall_pct // 5)}{'-' * (20 - (overall_pct // 5))}] {overall_pct}%")
    print(f"Total Topics: {completed_topics}/{total_topics} finished\n")

    print(f"{'Subject':<30} {'Exam Date':<14} {'Days Left':<11} {'Progress':<12}")
    print("-" * 70)

    today = date.today()
    for sub in subjects:
        exam_d = datetime.strptime(sub["examDate"], "%Y-%m-%d").date() if "T" not in sub["examDate"] else datetime.fromisoformat(sub["examDate"]).date()
        days_left = (exam_d - today).days

        sub_topics = [t for t in topics if t.get("subjectId") == sub["id"]]
        sub_total = len(sub_topics)
        sub_done = sum(1 for t in sub_topics if t.get("completed", False))
        sub_pct = int((sub_done / sub_total) * 100) if sub_total > 0 else 0

        days_str = f"{days_left} days" if days_left >= 0 else "Passed"
        progress_str = f"{sub_done}/{sub_total} ({sub_pct}%)"
        print(f"{sub['name'][:28]:<30} {str(exam_d):<14} {days_str:<11} {progress_str:<12}")
    print("-" * 70)

def cmd_schedule():
    data = load_data()
    topics = data.get("topics", [])
    subjects = {s["id"]: s["name"] for s in data.get("subjects", [])}

    print_header("MASTER DAILY STUDY PLAN & TIMETABLE")
    
    # Group by scheduled date
    schedule = {}
    for t in topics:
        d = t.get("scheduledDate", "Unscheduled")
        if d not in schedule:
            schedule[d] = []
        schedule[d].append(t)

    sorted_dates = sorted(schedule.keys())
    today_str = date.today().isoformat()

    for d in sorted_dates:
        is_today = " [TODAY's AGENDA]" if d == today_str else ""
        print(f"\n📅 Date: {d}{is_today}")
        day_topics = schedule[d]
        total_hrs = sum(t.get("estHours", 1.5) for t in day_topics)
        print(f"   ⏱️ Planned Study Time: ~{total_hrs:.1f} hours")
        
        # Calculate time slots
        curr_time = 8.5  # 08:30 AM
        for i, t in enumerate(day_topics, 1):
            dur = t.get("estHours", 1.5)
            start_h = int(curr_time)
            start_m = int((curr_time - start_h) * 60)
            end_time = curr_time + dur
            end_h = int(end_time)
            end_m = int((end_time - end_h) * 60)
            
            time_slot = f"{start_h:02d}:{start_m:02d} - {end_h:02d}:{end_m:02d}"
            status = "✓ [DONE]" if t.get("completed") else "○ [TODO]"
            sub_name = subjects.get(t.get("subjectId"), "Subject")
            print(f"   ⏰ {time_slot} | {status} {t.get('title')} ({sub_name}) [{dur}h]")
            
            curr_time = end_time + 0.25  # 15m break
            if i < len(day_topics):
                brk_h = int(curr_time)
                brk_m = int((curr_time - brk_h) * 60)
                print(f"   ☕ {end_h:02d}:{end_m:02d} - {brk_h:02d}:{brk_m:02d} | 15-Minute Brain Rest & Hydration Break")

def cmd_generate_plan():
    data = load_data()
    subjects = data.get("subjects", [])
    topics = data.get("topics", [])
    if not subjects or not topics:
        print("Need subjects and topics to generate a plan.")
        return

    print_header("GENERATE STUDY PLAN & TIMETABLE")
    daily_hrs = float(input("Enter daily study hours (default 3.5): ").strip() or "3.5")
    
    # Interleave pending topics across days
    pending = [t for t in topics if not t.get("completed")]
    curr_d = date.today()
    day_used = 0.0
    
    for t in pending:
        dur = t.get("estHours", 1.5)
        if day_used + dur > daily_hrs:
            curr_d += timedelta(days=1)
            day_used = 0.0
        t["scheduledDate"] = curr_d.isoformat()
        day_used += dur
        
    save_data(data)
    print(f"✨ Master Study Plan generated! Topics distributed starting from {date.today().isoformat()}.")
    cmd_schedule()

def cmd_add_subject():
    data = load_data()
    print_header("ADD NEW SUBJECT")
    name = input("Enter subject name: ").strip()
    if not name:
        print("Subject name cannot be empty.")
        return
    exam_str = input("Enter exam date (YYYY-MM-DD): ").strip()
    try:
        datetime.strptime(exam_str, "%Y-%m-%d")
    except ValueError:
        print("Invalid date format. Use YYYY-MM-DD.")
        return
    
    sub_id = f"sub_{int(datetime.now().timestamp())}"
    data["subjects"].append({
        "id": sub_id,
        "name": name,
        "examDate": exam_str,
        "color": "#6366f1"
    })
    save_data(data)
    print(f"Subject '{name}' added successfully!")

def cmd_add_topic():
    data = load_data()
    subjects = data.get("subjects", [])
    if not subjects:
        print("No subjects available. Add a subject first.")
        return

    print_header("ADD TOPIC")
    print("Choose subject:")
    for idx, s in enumerate(subjects, 1):
        print(f" {idx}. {s['name']}")
    try:
        choice = int(input("Select subject number: ").strip())
        selected_sub = subjects[choice - 1]
    except Exception:
        print("Invalid choice.")
        return

    title = input("Enter topic title: ").strip()
    if not title:
        print("Title cannot be empty.")
        return
    try:
        hours = float(input("Estimated hours (e.g. 2.0): ").strip() or "1.5")
    except ValueError:
        hours = 1.5

    data["topics"].append({
        "id": f"top_{int(datetime.now().timestamp())}",
        "subjectId": selected_sub["id"],
        "title": title,
        "estHours": hours,
        "completed": False,
        "scheduledDate": date.today().isoformat()
    })
    save_data(data)
    print(f"Topic '{title}' added to {selected_sub['name']}!")

def cmd_mark_completed():
    data = load_data()
    topics = [t for t in data.get("topics", []) if not t.get("completed")]
    subjects = {s["id"]: s["name"] for s in data.get("subjects", [])}

    if not topics:
        print("All topics are already marked completed! Great job!")
        return

    print_header("MARK TOPIC COMPLETED")
    for idx, t in enumerate(topics, 1):
        sub_name = subjects.get(t.get("subjectId"), "Subject")
        print(f" {idx}. [{sub_name}] {t.get('title')} ({t.get('estHours', 1.5)}h)")

    try:
        choice = int(input("Enter topic number to complete: ").strip())
        target = topics[choice - 1]
        target["completed"] = True
        save_data(data)
        print(f"🎉 Marked '{target.get('title')}' as COMPLETED! Progress updated.")
    except Exception:
        print("Invalid choice.")

def main():
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd in ("progress", "status"):
            cmd_progress()
        elif cmd in ("schedule", "daily"):
            cmd_schedule()
        elif cmd in ("plan", "generate"):
            cmd_generate_plan()
        elif cmd in ("add-subject", "subject"):
            cmd_add_subject()
        elif cmd in ("add-topic", "topic"):
            cmd_add_topic()
        elif cmd in ("complete", "done"):
            cmd_mark_completed()
        else:
            print("Usage: python planner.py [progress | schedule | plan | add-subject | add-topic | complete]")
        return

    # Interactive menu
    while True:
        print_header("SMART STUDY PLANNER CLI")
        print("1. View Progress Percentage & Upcoming Exams")
        print("2. View Daily Study Schedule & Timetable")
        print("3. Generate / Rebalance Study Plan")
        print("4. Mark Topic as Completed")
        print("5. Add New Subject & Exam Date")
        print("6. Add Topic to Subject")
        print("7. Open Interactive Web App (GUI)")
        print("8. Exit")

        choice = input("\nSelect an option (1-8): ").strip()
        if choice == "1":
            cmd_progress()
        elif choice == "2":
            cmd_schedule()
        elif choice == "3":
            cmd_generate_plan()
        elif choice == "4":
            cmd_mark_completed()
        elif choice == "5":
            cmd_add_subject()
        elif choice == "6":
            cmd_add_topic()
        elif choice == "7":
            import subprocess
            subprocess.Popen([sys.executable, "server.py"])
            print("Opening Web App in browser...")
        elif choice == "8":
            print("Happy studying! Goodbye. 🎓")
            break
        else:
            print("Invalid selection.")

if __name__ == "__main__":
    main()
