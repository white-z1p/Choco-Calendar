import { useEffect, useRef, useState } from 'react';
import MonthCalendar from '../MonthCalendar';
import DiaryDetailPanel from './DiaryDetailPanel';
import TimeInputModal from '../modals/TimeInputModal';
import TrackerEditModal from '../modals/TrackerEditModal';
import { dk } from '../../utils/time';
import { getWeather } from '../../utils/weather';
import {
  addTrackerEntry,
  updateTrackerEntry,
} from '../../firebase/diaryApi';

const now = new Date();

export default function DiaryTab({ diaries }) {
  const [vY, setVY] = useState(now.getFullYear());
  const [vM, setVM] = useState(now.getMonth());
  const [sel, setSel] = useState(null);

  const [weatherCache, setWeatherCache] = useState({});
  const [locationDenied, setLocationDenied] = useState(false);

  const [timeModal, setTimeModal] = useState({
    open: false,
    type: null,
  });

  const [trackerEdit, setTrackerEdit] = useState({
    open: false,
    entry: null,
  });

  const fetchedOnce = useRef(false);

  /* ==================================================
     오늘 날씨 미리 가져오기
  ================================================== */
  useEffect(() => {
    if (fetchedOnce.current) return;

    fetchedOnce.current = true;

    const todayKey = dk(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    getWeather(
      (w) => {
        setWeatherCache((current) => ({
          ...current,
          [todayKey]: w,
        }));
      },
      () => {},
      () => {
        setLocationDenied(true);
      }
    );
  }, []);

  /* ==================================================
     특정 날짜 날씨 가져오기
  ================================================== */
  const fetchWeatherForKey = (key, done) => {
    if (weatherCache[key]) {
      done();
      return;
    }

    getWeather(
      (w) => {
        setWeatherCache((current) => ({
          ...current,
          [key]: w,
        }));

        done();
      },
      () => {
        done();
      },
      () => {
        setLocationDenied(true);
      }
    );
  };

  /* ==================================================
     캘린더 기록 점
  ================================================== */
  const getDots = (key) => {
    const dayData = diaries[key];

    if (!dayData) return [];

    const count = Object.keys(dayData).filter(
      (id) => id !== '__care__'
    ).length;

    return Array.from(
      {
        length: Math.min(count, 3),
      },
      () => ''
    );
  };

  /* ==================================================
     월 변경
  ================================================== */
  const changeMonth = (delta) => {
    let m = vM + delta;
    let y = vY;

    if (m < 0) {
      m = 11;
      y -= 1;
    }

    if (m > 11) {
      m = 0;
      y += 1;
    }

    setVM(m);
    setVY(y);
    setSel(null);
  };

  /* ==================================================
     선택한 날짜가 오늘인지 확인
  ================================================== */
  const isSelToday =
    sel &&
    sel.d === now.getDate() &&
    sel.m === now.getMonth() &&
    sel.y === now.getFullYear();

  return (
    <div className="tab-view">

      {/* ==================================================
          위치 권한 안내
      ================================================== */}
      {locationDenied && (
        <div
          style={{
            background: '#FFF3CD',
            color: '#856404',
            fontSize: '0.78rem',
            padding: '10px 16px',
            textAlign: 'center',
            lineHeight: 1.6,
            borderBottom:
              '0.5px solid rgba(133,100,4,0.25)',
          }}
        >
          📍 위치 권한이 꺼져 있어요.
          브라우저 주소창의 🔒 아이콘을 눌러
          위치를 허용하면 실제 날씨를 볼 수 있어요.
        </div>
      )}

      {/* ==================================================
          달력
      ================================================== */}
      <MonthCalendar
        year={vY}
        month={vM}
        selected={sel}
        today={now}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
        onSelectDay={(d) =>
          setSel({
            y: vY,
            m: vM,
            d,
          })
        }
        getDots={getDots}
      />

      <div className="divider">
        🐾 🐾 🐾
      </div>

      {/* ==================================================
          날짜 선택
      ================================================== */}
      {sel ? (
        <DiaryDetailPanel
          key={dk(
            sel.y,
            sel.m,
            sel.d
          )}
          y={sel.y}
          m={sel.m}
          d={sel.d}
          diaries={diaries}
          isToday={isSelToday}
          weatherCache={weatherCache}
          onFetchWeather={fetchWeatherForKey}
          onClose={() => setSel(null)}

          onOpenTracker={(type) => {
            setTimeModal({
              open: true,
              type,
            });
          }}

          onOpenTrackerEdit={(
            type,
            id,
            val1,
            val2
          ) => {
            setTrackerEdit({
              open: true,
              entry: {
                type,
                id,
                val1,
                val2,
              },
            });
          }}
        />
      ) : (
        <div className="no-sel">
          <div className="paw">
            🐾
          </div>

          <p>
            날짜를 탭해서
            <br />
            초코의 하루를 기록해요!
          </p>
        </div>
      )}

      {/* ==================================================
          급여 / 껌 추가 모달
      ================================================== */}
      <TimeInputModal
        open={timeModal.open}
        type={timeModal.type}
        onClose={() =>
          setTimeModal({
            open: false,
            type: null,
          })
        }
        onSave={({ start, content, memo }) => {
          if (!sel) return;

          const key = dk(
            sel.y,
            sel.m,
            sel.d
          );

          const data = {
            time: start,
            content: content || '',
            memo: memo || '',
          };

          addTrackerEntry(
            key,
            timeModal.type,
            data
          )
            .then(() => {
              setTimeModal({
                open: false,
                type: null,
              });
            })
            .catch((err) => {
              alert(
                '저장 실패: ' +
                err.message
              );
            });
        }}
      />

      {/* ==================================================
          급여 / 껌 수정 모달
      ================================================== */}
      <TrackerEditModal
        open={trackerEdit.open}
        entry={trackerEdit.entry}
        onClose={() =>
          setTrackerEdit({
            open: false,
            entry: null,
          })
        }
        onSave={({ val1, content, memo }) => {
          if (!sel) return;

          const key = dk(
            sel.y,
            sel.m,
            sel.d
          );

          const {
            type,
            id,
          } = trackerEdit.entry;

          const data = {
            time: val1,
            content: content || '',
            memo: memo || '',
          };

          updateTrackerEntry(
            key,
            type,
            id,
            data
          )
            .then(() => {
              setTrackerEdit({
                open: false,
                entry: null,
              });
            })
            .catch((err) => {
              alert(
                '수정 실패: ' +
                err.message
              );
            });
        }}
      />
    </div>
  );
}