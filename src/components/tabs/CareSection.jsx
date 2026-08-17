import { useState } from "react";
import { parseTimeToMinutes } from "../../utils/time";
import { saveCareNotes, deleteTrackerEntry } from "../../firebase/diaryApi";

const MEAL_ITEMS = [
  {
    id: "meal_morning",
    emoji: "🍚",
    label: "아침",
    multiple: false,
  },
  {
    id: "meal_evening",
    emoji: "🍚",
    label: "저녁",
    multiple: false,
  },
  {
    id: "meal_snack",
    emoji: "🦴",
    label: "간식",
    multiple: true,
  },
  {
    id: "gum",
    emoji: "🦷",
    label: "껌",
    multiple: false,
  },
];

function getEntries(log) {
  if (!log) return [];

  return Object.entries(log)
    .map(([id, value]) => ({
      id,
      ...value,
    }))
    .filter((entry) => entry.time)
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

function getMealLog(care) {
  return getEntries(care?.mealLog);
}

function getGumLog(care) {
  return getEntries(care?.gumLog);
}

function getLabel(type) {
  const item = MEAL_ITEMS.find((item) => item.id === type);

  return item?.label || type;
}

function getEmoji(type) {
  const item = MEAL_ITEMS.find((item) => item.id === type);

  return item?.emoji || "🐾";
}

export default function CareSection({
  dateKey,
  care,
  onOpenTracker,
  onOpenTrackerEdit,
}) {
  const [notesEditOpen, setNotesEditOpen] = useState(false);

  const [notesDraft, setNotesDraft] = useState("");

  const mealEntries = getMealLog(care);
  const gumEntries = getGumLog(care);

  /*
   * 아침 / 저녁 / 간식 / 껌을
   * 하나의 타임라인으로 합친다.
   */
  const allEntries = [
    ...mealEntries.map((entry) => ({
      ...entry,
      type: entry.type || "meal_morning",
    })),

    ...gumEntries.map((entry) => ({
      ...entry,
      type: "gum",
    })),
  ].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  const careNotes = care?.notes || "";

  const openNotes = () => {
    setNotesDraft(careNotes);
    setNotesEditOpen(true);
  };

  const saveNotes = async () => {
    try {
      await saveCareNotes(dateKey, notesDraft.trim());

      setNotesEditOpen(false);
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await deleteTrackerEntry(dateKey, type, id);
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleEdit = (entry) => {
    onOpenTrackerEdit(
      entry.type,
      entry.id,
      entry.time || "",
      entry.content || "",
      entry.memo || "",
    );
  };

  return (
    <>
      <div className="care-section">
        <div className="care-title">🐾 오늘의 케어</div>

        <div className="care-title">급여 체크 ⓘ</div>

        {/* =====================================
            아침 / 저녁 / 간식 / 껌 버튼
        ====================================== */}
        <div className="meal-check-grid">
          {MEAL_ITEMS.map((item) => {
            const entries =
              item.id === "gum"
                ? gumEntries
                : mealEntries.filter((entry) => entry.type === item.id);

            /*
             * 아침 / 저녁 / 껌은 하루 1회.
             * 이미 기록이 있으면 추가 버튼을 막는다.
             *
             * 간식은 여러 번 가능.
             */
            const alreadyRecorded = !item.multiple && entries.length > 0;

            return (
              <button
                key={item.id}
                type="button"
                className={`meal-check-card${
                  !item.multiple && entries.length > 0 ? " has-record" : ""
                }${alreadyRecorded ? " disabled" : ""}`}
                disabled={alreadyRecorded}
                onClick={() => onOpenTracker(item.id)}
              >
                <span className="meal-check-label">{item.label}</span>

                <span className="meal-check-emoji">{item.emoji}</span>

                <span className="meal-check-status">
                  {item.multiple
                    ? "기록하기"
                    : entries.length > 0
                      ? "기록 완료"
                      : "기록하기"}
                </span>
              </button>
            );
          })}
        </div>

        {/* =====================================
            오늘의 케어 타임라인
        ====================================== */}
        <div className="care-timeline">
          {allEntries.length === 0 ? (
            <div className="empty-day">아직 급여 기록이 없어요.</div>
          ) : (
            allEntries.map((entry) => (
              <div
                className="care-timeline-item"
                key={`${entry.type}-${entry.id}`}
              >
                <div className="care-timeline-time">{entry.time}</div>

                <div className="care-timeline-dot">{getEmoji(entry.type)}</div>

                <div className="care-timeline-content">
                  <div className="care-timeline-title">
                    {getLabel(entry.type)}
                  </div>

                  {/* 내용 */}
                  {entry.content && (
                    <div className="care-timeline-content-text">
                      {entry.content}
                    </div>
                  )}

                  {/* 메모 */}
                  {entry.memo && (
                    <div className="care-timeline-memo">📝 {entry.memo}</div>
                  )}
                </div>

                <div className="care-timeline-actions">
                  <button
                    className="tl-edit"
                    type="button"
                    onClick={() => handleEdit(entry)}
                  >
                    수정
                  </button>

                  <button
                    className="tl-del"
                    type="button"
                    onClick={() => handleDelete(entry.type, entry.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* =====================================
          기타 / 특이사항
      ====================================== */}
      <div className="care-notes-section">
        <div className="care-notes-title">📝 기타 / 특이사항</div>

        {notesEditOpen ? (
          <div className="care-notes-form">
            <textarea
              className="care-notes-textarea"
              placeholder="토했거나 특이사항을 적어주세요"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              autoFocus
            />

            <div className="care-notes-btns">
              <button
                className="care-notes-save"
                type="button"
                onClick={saveNotes}
              >
                저장
              </button>

              <button
                className="care-notes-cancel"
                type="button"
                onClick={() => setNotesEditOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`care-notes-display${careNotes ? "" : " empty"}`}
            onClick={openNotes}
          >
            {careNotes || "✏️ 특이사항을 기록해요 (토했거나, 이상한 점 등)"}
          </div>
        )}
      </div>
    </>
  );
}
