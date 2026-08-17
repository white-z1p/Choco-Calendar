import { useEffect, useState } from 'react';
import {
  DAYS,
  MONTHS,
  parseTimeToMinutes,
} from '../../utils/time';

import {
  mockWx,
  suit,
} from '../../utils/weather';

import {
  CloseIcon,
  PlusIcon,
} from '../Icons';

import CareSection from './CareSection';
import DiaryEntryForm from './DiaryEntryForm';

import {
  addDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '../../firebase/diaryApi';


function getEvs(
  diaries,
  key
) {
  const dayData = diaries[key];

  if (!dayData) return [];

  const list = [];

  for (const id in dayData) {

    /*
     * 케어 기록은 일반 일기 목록에서 제외
     */
    if (id === '__care__') continue;

    list.push({
      _id: id,
      ...dayData[id],
    });
  }

  return list.sort(
    (a, b) =>
      parseTimeToMinutes(a.time) -
      parseTimeToMinutes(b.time)
  );
}


export default function DiaryDetailPanel({
  y,
  m,
  d,
  diaries,
  isToday,
  weatherCache,
  onFetchWeather,
  onClose,
  onOpenTracker,
  onOpenTrackerEdit,
}) {
  const key =
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const [wxOpen, setWxOpen] =
    useState(false);

  const [addOpen, setAddOpen] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  const [weatherLoading, setWeatherLoading] =
    useState(false);


  const evs =
    getEvs(
      diaries,
      key
    );

  const care =
    (diaries[key] &&
      diaries[key].__care__) ||
    {};


  /* ==========================================
     오늘 날씨 가져오기
  ========================================== */

  useEffect(() => {
    if (
      isToday &&
      !weatherCache[key]
    ) {
      setWeatherLoading(true);

      onFetchWeather(
        key,
        () =>
          setWeatherLoading(false)
      );
    }
  }, [
    isToday,
    key,
  ]);


  const w =
    isToday &&
    weatherCache[key]
      ? weatherCache[key]
      : mockWx(y, m, d);

  const s = suit(w);

  const dow =
    new Date(
      y,
      m,
      d
    ).getDay();

  const dlbl =
    `🐶 ${MONTHS[m]} ${d}일 (${DAYS[dow]})`;


  /* ==========================================
     일반 일기 추가
  ========================================== */

  const handleAdd = ({
    time,
    name,
    memo,
  }) => {
    addDiaryEntry(
      key,
      {
        time,
        name,
        memo,
      }
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


  /* ==========================================
     일반 일기 수정
  ========================================== */

  const handleEdit = ({
    time,
    name,
    memo,
  }) => {
    updateDiaryEntry(
      key,
      editId,
      {
        time,
        name,
        memo,
      }
    )
      .then(() =>
        setEditId(null)
      )
      .catch((err) =>
        alert(
          '수정 실패: ' +
          err.message
        )
      );
  };


  const editingEv =
    editId
      ? evs.find(
          (e) =>
            e._id === editId
        )
      : null;


  return (
    <div className="panel">

      {/* =====================================
          날짜
      ====================================== */}

      <div className="panel-header">

        <div className="panel-date">
          {dlbl}
        </div>

        <button
          className="close-btn"
          aria-label="닫기"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

      </div>


      {/* =====================================
          날씨
      ====================================== */}

      {weatherLoading ? (

        <div
          className="panel"
          style={{
            padding: 30,
            textAlign: 'center',
            color: 'var(--text-hint)',
          }}
        >
          위치 날씨 정보를 읽어오는 중... 🌤️
        </div>

      ) : (

        <>

          <div
            className="wx-strip"
            onClick={() =>
              setWxOpen(
                (v) => !v
              )
            }
          >

            <div className="wx-icon">
              {w.icon}
            </div>

            <div
              style={{
                flex: 1,
              }}
            >

              <div className="wx-temp">
                {w.temp}°C &nbsp;
                {w.cond}
              </div>

              <div
                className="wx-hint"
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >

                <span>
                  최저 <b>{w.tempMin}°</b>
                </span>

                <span
                  style={{
                    opacity: 0.4,
                  }}
                >
                  |
                </span>

                <span>
                  최고 <b>{w.tempMax}°</b>
                </span>

                <span
                  style={{
                    marginLeft: 2,
                  }}
                >
                  {wxOpen
                    ? '· 접기 ↑'
                    : '· 자세히 ↓'}
                </span>

              </div>

            </div>

            {!wxOpen && (
              <span
                className={`suit-badge ${s.cls}`}
              >
                {s.lbl}
              </span>
            )}

          </div>


          {wxOpen && (

            <div className="wx-detail">

              <div className="wx-grid">

                <div className="wx-metric">
                  <div className="wx-ml">
                    체감온도
                  </div>
                  <div className="wx-mv">
                    {w.feels}°C
                  </div>
                </div>

                <div className="wx-metric">
                  <div className="wx-ml">
                    습도
                  </div>
                  <div className="wx-mv">
                    {w.humid}%
                  </div>
                </div>

                <div className="wx-metric">
                  <div className="wx-ml">
                    바람
                  </div>
                  <div className="wx-mv">
                    {w.wind}m/s
                  </div>
                </div>

              </div>

              <div className="wx-advice">
                {s.desc}
              </div>

              <span
                className={`suit-badge ${s.cls}`}
              >
                {s.lbl}
              </span>

            </div>
          )}

        </>
      )}


      {/* =====================================
          오늘의 케어
      ====================================== */}

      <CareSection
        dateKey={key}
        care={care}
        onOpenTracker={onOpenTracker}
        onOpenTrackerEdit={
          onOpenTrackerEdit
        }
      />


      {/* =====================================
          일반 일기 목록
      ====================================== */}

      <div>

        {evs.length === 0 ? (

          <div className="empty-day">
            아직 기록이 없어요.
            <br />
            아래 버튼으로 추가해보세요!
          </div>

        ) : (

          evs.map((ev) => (

            <div
              className="tl-ev"
              key={ev._id}
            >

              <div className="tl-time">
                {ev.time}
              </div>

              <div className="tl-content">

                <div className="tl-name">
                  {ev.name}
                </div>

                {ev.memo && (
                  <div className="tl-memo">
                    {ev.memo}
                  </div>
                )}

              </div>

              <div className="tl-btns">

                <button
                  className="tl-edit"
                  onClick={() => {
                    setEditId(
                      ev._id
                    );
                    setAddOpen(false);
                  }}
                >
                  수정
                </button>

                <button
                  className="tl-del"
                  onClick={() =>
                    deleteDiaryEntry(
                      key,
                      ev._id
                    ).catch(
                      (err) =>
                        alert(
                          '삭제 실패: ' +
                          err.message
                        )
                    )
                  }
                >
                  삭제
                </button>

              </div>

            </div>

          ))
        )}

      </div>


      {/* =====================================
          일반 일기 추가 / 수정
      ====================================== */}

      <div className="add-area">

        {addOpen ? (

          <DiaryEntryForm
            submitLabel="추가"
            onSubmit={handleAdd}
            onCancel={() =>
              setAddOpen(false)
            }
          />

        ) : editId ? (

          <DiaryEntryForm
            initial={editingEv}
            submitLabel="저장"
            onSubmit={handleEdit}
            onCancel={() =>
              setEditId(null)
            }
          />

        ) : (

          <button
            className="add-open-btn"
            onClick={() => {
              setAddOpen(true);
              setEditId(null);
            }}
          >
            <PlusIcon />
            기록 추가하기
          </button>

        )}

      </div>

    </div>
  );
}