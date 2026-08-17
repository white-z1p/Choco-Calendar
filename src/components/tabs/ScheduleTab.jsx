import ScheduleTypeTab from './ScheduleTypeTab';

export default function ScheduleTab({ schedules }) {
  return (
    <div className="tab-view">
      <ScheduleTypeTab
        schedules={schedules}
        emptyHint={<>날짜를 탭해서<br />미용 · 심장사상충 · 병원 진료 등<br />일정을 기록해요!</>}
      />
    </div>
  );
}
