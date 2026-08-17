import { useState } from 'react';

import WalkTracker from '../WalkTracker';
import WalkMapPreview from '../WalkMapPreview';
import WalkEntryForm from './WalkEntryForm';
import { PlusIcon } from '../Icons';

import {
  dk,
  DAYS,
  MONTHS,
} from '../../utils/time';

import {
  formatDistance,
  formatDuration,
} from '../../utils/geo';

import {
  addWalkSession,
  updateWalkSession,
  deleteTrackerEntry,
} from '../../firebase/diaryApi';


/* ==================================================
   산책 히스토리 만들기
================================================== */

function buildHistory(diaries) {
  const list = [];

  for (const dateKey in diaries) {
    const log =
      diaries[dateKey]
        ?.__care__
        ?.walkLog;

    if (!log) continue;

    for (const id in log) {
      list.push({
        dateKey,
        id,
        ...log[id],
      });
    }
  }

  list.sort(
    (a, b) =>
      (b.startedAt || 0) -
      (a.startedAt || 0)
  );

  return list;
}


/* ==================================================
   날짜 표시
================================================== */

function formatDateLabel(dateKey) {
  const [
    y,
    m,
    d,
  ] = dateKey
    .split('-')
    .map(Number);

  const dow = new Date(
    y,
    m - 1,
    d
  ).getDay();

  return `${MONTHS[m - 1]} ${d}일 (${DAYS[dow]})`;
}


/* ==================================================
   시작 시간 → timestamp
================================================== */

function toStartedAt(
  date,
  time
) {
  const m = (
    time || ''
  ).match(
    /^(\d{1,2}):(\d{2})/
  );

  const hh = m
    ? String(m[1]).padStart(
        2,
        '0'
      )
    : '12';

  const mm = m
    ? m[2]
    : '00';

  const t = new Date(
    `${date}T${hh}:${mm}:00`
  ).getTime();

  return isNaN(t)
    ? Date.now()
    : t;
}


export default function WalkTab({
  diaries,
  profile,
}) {
  const [walkOpen, setWalkOpen] =
    useState(false);

  const [addOpen, setAddOpen] =
    useState(false);

  const [editEntry, setEditEntry] =
    useState(null);

  const history =
    buildHistory(diaries);


  /* ==================================================
     수기 산책 기록 추가
  ================================================== */

  const handleManualAdd = (
    data
  ) => {
    const {
      date,
      time,
      distanceM,
      durationSec,
      memo,
    } = data;

    const startedAt =
      toStartedAt(
        date,
        time
      );

    const payload = {
      distanceM,
      durationSec,
      memo,
      startedAt,
      endedAt:
        startedAt +
        durationSec * 1000,
    };

    addWalkSession(
      date,
      payload
    )
      .then(() =>
        setAddOpen(false)
      )
      .catch((err) =>
        alert(
          '저장 실패: ' +
            err.message
        )
      );
  };


  /* ==================================================
     수기 산책 기록 수정
  ================================================== */

  const handleManualEdit = (
    data
  ) => {
    const {
      date,
      time,
      distanceM,
      durationSec,
      memo,
    } = data;

    const {
      dateKey: oldDateKey,
      id,
    } = editEntry;

    const startedAt =
      toStartedAt(
        date,
        time
      );

    const payload = {
      distanceM,
      durationSec,
      memo,
      startedAt,
      endedAt:
        startedAt +
        durationSec * 1000,
    };

    const done =
      date === oldDateKey
        ? updateWalkSession(
            oldDateKey,
            id,
            payload
          )
        : Promise.all([
            deleteTrackerEntry(
              oldDateKey,
              'walk',
              id
            ),
            addWalkSession(
              date,
              payload
            ),
          ]);

    done
      .then(() =>
        setEditEntry(null)
      )
      .catch((err) =>
        alert(
          '수정 실패: ' +
            err.message
        )
      );
  };


  return (
    <div className="tab-view">

      {/* ==========================================
          산책 지도
      ========================================== */}

      <WalkMapPreview
        avatar={{
          photoURL:
            profile?.photoURL,
          emoji:
            profile?.avatarEmoji,
        }}
        onStart={() =>
          setWalkOpen(true)
        }
      />


      {/* ==========================================
          산책 히스토리
      ========================================== */}

      <div
        className="section-block"
        style={{
          marginTop: 14,
        }}
      >
        <div className="section-block-title">
          🕰️ 산책 히스토리
        </div>

        <div className="timeline-panel">
          {history.length ? (
            history.map((e) => {
              const timeLabel =
                e.startedAt
                  ? new Date(
                      e.startedAt
                    )
                      .toTimeString()
                      .slice(0, 5)
                  : '';

              return (
                <div
                  className="timeline-item"
                  key={`${e.dateKey}-${e.id}`}
                >
                  <div className="timeline-dot-icon">
                    🦮
                  </div>

                  <div className="timeline-body">
                    <div className="timeline-title">
                      {formatDistance(
                        e.distanceM || 0
                      )}{' '}
                      ·{' '}
                      {formatDuration(
                        e.durationSec ||
                          0
                      )}
                    </div>

                    <div className="timeline-date">
                      {formatDateLabel(
                        e.dateKey
                      )}

                      {timeLabel
                        ? ` · ${timeLabel}`
                        : ''}
                    </div>

                    {e.memo && (
                      <div className="timeline-memo">
                        {e.memo}
                      </div>
                    )}
                  </div>

                  <div className="tl-btns">
                    <button
                      className="tl-edit"
                      onClick={() => {
                        setEditEntry(e);
                        setAddOpen(false);
                      }}
                    >
                      수정
                    </button>

                    <button
                      className="tl-del"
                      onClick={() =>
                        deleteTrackerEntry(
                          e.dateKey,
                          'walk',
                          e.id
                        ).catch(
                          (err) =>
                            alert(
                              '삭제 실패: ' +
                                err.message
                            )
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="timeline-empty">
              아직 산책 기록이 없어요.
              <br />
              위에서 산책을 시작하거나
              수기로 기록해보세요!
            </div>
          )}
        </div>


        {/* ==========================================
            수기 기록 추가 / 수정
        ========================================== */}

        <div
          style={{
            marginTop: 10,
          }}
        >
          {addOpen ? (
            <WalkEntryForm
              submitLabel="추가"
              onSubmit={
                handleManualAdd
              }
              onCancel={() =>
                setAddOpen(false)
              }
            />
          ) : editEntry ? (
            <WalkEntryForm
              initial={{
                date:
                  editEntry.dateKey,

                time:
                  editEntry.startedAt
                    ? new Date(
                        editEntry.startedAt
                      )
                        .toTimeString()
                        .slice(0, 5)
                    : '',

                km:
                  editEntry.distanceM
                    ? +(
                        editEntry.distanceM /
                        1000
                      ).toFixed(2)
                    : '',

                minutes:
                  editEntry.durationSec
                    ? Math.round(
                        editEntry.durationSec /
                          60
                      )
                    : '',

                memo:
                  editEntry.memo ||
                  '',
              }}
              submitLabel="저장"
              onSubmit={
                handleManualEdit
              }
              onCancel={() =>
                setEditEntry(null)
              }
            />
          ) : (
            <button
              className="add-open-btn"
              onClick={() => {
                setAddOpen(true);
                setEditEntry(null);
              }}
            >
              <PlusIcon />
              수기로 기록 추가하기
            </button>
          )}
        </div>
      </div>


      {/* ==========================================
          실제 산책 기록
      ========================================== */}

      <WalkTracker
        open={walkOpen}
        avatar={{
          photoURL:
            profile?.photoURL,
          emoji:
            profile?.avatarEmoji,
        }}
        onClose={() =>
          setWalkOpen(false)
        }
        onSave={(session) => {
          const today =
            new Date();

          const key = dk(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          addWalkSession(
            key,
            session
          )
            .then(() =>
              setWalkOpen(false)
            )
            .catch((err) => {
              alert(
                '산책 기록 저장 실패: ' +
                  err.message
              );

              setWalkOpen(false);
            });
        }}
      />
    </div>
  );
}