import React, { useMemo, useState, useCallback } from "react";
import { Scheduler, SchedulerData } from "@bitnoi.se/react-scheduler";
import "dayjs/locale/en";
import "@bitnoi.se/react-scheduler/dist/style.css";
import dayjs from "dayjs";
import { useTickets } from "../context/TicketContext";

/**
 * RoadmapView Component
 * 
 * A visual representation of the project roadmap organized by milestones.
 * Displays milestones with progress tracking, due dates, and associated tickets.
 * 
 * Features:
 * - Milestone progress bars with completion percentage
 * - Due date tracking for each milestone
 * - Visual status indicators for tickets
 * - Priority indicators
 * - Assignee information
 * - Empty state handling
 * 
 * @component
 * @returns {JSX.Element} The RoadmapView component with milestone timeline and tickets
 * 
 * @example
 * ```tsx
 * import RoadmapView from './components/RoadmapView'
 * 
 * function App() {
 *   return (
 *     <div>
 *       <RoadmapView />
 *     </div>
 *   )
 * }
 * ```
 */
const RoadmapView: React.FC = () => {
  const { tickets, loading, error } = useTickets();
  const [_, setRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("month").toDate(),
    endDate: dayjs().endOf("month").toDate(),
  });

  // Complexity mapping: hours per complexity
  const complexityHours: Record<string, number> = {
    xs: 1,
    s: 4,
    m: 16,
    l: 32,
    xl: 64,
    xxl: 80,
    low: 8, // fallback for legacy values
    medium: 24,
    high: 40,
  };

  // Group tickets by contributor
  const schedulerData: SchedulerData = useMemo(() => {
    const contributors = Array.from(
      new Set(tickets.map((t) => t.contributor).filter((c): c is string => Boolean(c)))
    );
    return contributors.map((contributor) => ({
      id: contributor,
      label: {
        icon: `http://localhost:8080/api/icon?value=${encodeURIComponent(contributor)}`, // default Octocat icon
        title: contributor,
        subtitle: contributor,
      },
      data: tickets
        .filter((t) => t.contributor === contributor)
        .map((t) => {
          // Scheduling logic
          let startDate: Date;
          if (typeof t.start_time === 'number' && t.start_time >= 0) {
            startDate = new Date(t.start_time);
          } else {
            startDate = dayjs().startOf('day').toDate();
          }

          let endDate: Date;
          if (typeof t.end_time === 'number' && t.end_time >= 0) {
            endDate = new Date(t.end_time);
          } else {
            // Calculate duration from complexity
            const hours = complexityHours[t.complexity] || 8;
            endDate = dayjs(startDate).add(hours, 'hour').toDate();
          }

          return {
            id: t.id,
            title: t.title,
            subtitle: t.status,
            description: t.description,
            startDate,
            endDate,
            occupancy: ((endDate.getTime() - startDate.getTime()) / 1000),
            bgColor:
              t.status === "done"
                ? "#b6e3b6"
                : t.status === "in-progress"
                ? "#ffe066"
                : "#e0e0e0",
          };
        }),
    }));
  }, [tickets]);

  const handleRangeChange = useCallback((range: { startDate: Date; endDate: Date }) => setRange(range), []);

  // Loading state
  if (loading) return (
    <div className="page-container">
      <div className="text-center py-12 text-gray-500">Loading roadmap…</div>
    </div>
  );
  // Error state
  if (error) return (
    <div className="page-container">
      <div className="text-center py-12 text-red-500">{error}</div>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "80vh",
        width: "100%",
        marginLeft: "0", // adjust to match your sidebar width
        background: "#fff",
        overflow: "auto",
      }}
    >
      <Scheduler
        data={schedulerData}
        isLoading={loading}
        onRangeChange={handleRangeChange}
        config={{
          zoom: 2,
          lang: "en",
          showThemeToggle: true,
        }}
      />
    </div>
  );
};

export default RoadmapView;
// End of component
