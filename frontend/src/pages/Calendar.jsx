import React, { useMemo, useState, useEffect } from 'react'
import { api } from '../api/client.js'

const USE_API = true

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Map course gradient classes to sidebar hex colors
const COLOR_MAP = {
  'from-blue-500 to-blue-600': '#3B82F6',
  'from-green-500 to-green-600': '#22C55E',
  'from-orange-500 to-orange-600': '#F97316',
  'from-purple-500 to-purple-600': '#A855F7',
  'from-red-500 to-red-600': '#EF4444',
  'from-teal-500 to-teal-600': '#14B8A6',
  'from-gray-500 to-gray-600': '#6B7280',
  'from-pink-500 to-pink-600': '#EC4899',
}

function parseDueDate(dueStr, year = 2025) {
  try {
    const withYear = dueStr.includes(String(year)) ? dueStr : `${dueStr} ${year}`
    const d = new Date(withYear)
    if (isNaN(d.getTime())) return null
    return d
  } catch {
    return null
  }
}

function buildEvents(courseSources) {
  const events = []
  courseSources.forEach((course) => {
    const color = course.color || 'from-gray-500 to-gray-600'
    const hexColor = COLOR_MAP[color] || '#6B7280'
    course.assignments?.forEach((a) => {
      const d = parseDueDate(a.dueDate)
      if (d) {
        events.push({
          id: `ev-${course.id}-${a.id}`,
          title: a.title,
          date: d,
          dueTime: '11:59pm',
          calendarId: course.id,
          calendarName: course.name || course.code,
          color: hexColor,
          type: 'assignment',
        })
      }
    })
  })
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// Calendars for sidebar (personal + courses)
function buildCalendars(courseSources) {
  const list = [
    { id: 'personal', name: 'Sadiq Haruna', color: '#3B82F6', visible: true },
  ]
  courseSources.forEach((c) => {
    const color = COLOR_MAP[c.color] || '#6B7280'
    list.push({
      id: c.id,
      name: c.name || c.code,
      color,
      visible: true,
    })
  })
  return list
}

export function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [view, setView] = useState('month') // 'week' | 'month' | 'agenda'
  const [weekStart, setWeekStart] = useState(1) // day of month for week/agenda start
  const [apiCourseDetails, setApiCourseDetails] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editEvent, setEditEvent] = useState(null)

  useEffect(() => {
    if (!USE_API) return
    api
      .getCourses()
      .then((courses) => {
        Promise.all(courses.map((c) => api.getCourse(c.id)))
          .then((details) => setApiCourseDetails(details))
          .catch(() => setApiCourseDetails([]))
      })
      .catch(() => setApiCourseDetails([]))
  }, [])

  const courseSources = useMemo(() => {
    if (USE_API && apiCourseDetails.length > 0) return apiCourseDetails
    return []
  }, [USE_API, apiCourseDetails])

  const events = useMemo(() => buildEvents(courseSources), [courseSources])
  const calendars = useMemo(() => buildCalendars(courseSources), [courseSources])

  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setWeekStart(today.getDate())
  }

  const goPrev = () => {
    if (view === 'month') {
      setMonth((m) => {
        if (m === 0) {
          setYear((y) => y - 1)
          return 11
        }
        return m - 1
      })
    } else {
      const d = new Date(year, month, weekStart)
      d.setDate(d.getDate() - (view === 'week' ? 7 : 16))
      setYear(d.getFullYear())
      setMonth(d.getMonth())
      setWeekStart(d.getDate())
    }
  }

  const goNext = () => {
    if (view === 'month') {
      setMonth((m) => {
        if (m === 11) {
          setYear((y) => y + 1)
          return 0
        }
        return m + 1
      })
    } else {
      const d = new Date(year, month, weekStart)
      d.setDate(d.getDate() + (view === 'week' ? 7 : 16))
      setYear(d.getFullYear())
      setMonth(d.getMonth())
      setWeekStart(d.getDate())
    }
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const openAddEvent = (date) => {
    setEditEvent({
      title: '',
      date: date || new Date(year, month, weekStart),
      from: '',
      to: '',
      frequency: 'Does not repeat',
      location: '',
      calendarId: 'personal',
    })
    setEditModalOpen(true)
  }

  const openEditEvent = (ev) => {
    setEditEvent({
      ...ev,
      date: ev.date,
      from: ev.dueTime || '',
      to: '',
      frequency: 'Does not repeat',
      location: '',
      calendarId: ev.calendarId,
    })
    setEditModalOpen(true)
  }

  // Month grid events by day
  const eventsByDay = useMemo(() => {
    const map = {}
    events.forEach((e) => {
      const key = `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [events])

  // Week view: events for the 7-day range
  const weekStartDate = useMemo(() => new Date(year, month, weekStart), [year, month, weekStart])
  const weekEvents = useMemo(() => {
    const start = new Date(weekStartDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return events.filter((e) => {
      const t = e.date.getTime()
      return t >= start.getTime() && t < end.getTime()
    })
  }, [events, weekStartDate])

  // Agenda: events for date range
  const agendaStart = useMemo(() => new Date(year, month, weekStart), [year, month, weekStart])
  const agendaEnd = useMemo(() => {
    const d = new Date(agendaStart)
    d.setDate(d.getDate() + 15)
    return d
  }, [agendaStart])
  const agendaEvents = useMemo(() => {
    const start = new Date(agendaStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(agendaEnd)
    end.setHours(23, 59, 59, 999)
    return events.filter((e) => e.date >= start && e.date <= end)
  }, [events, agendaStart, agendaEnd])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={goPrev}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-base font-medium text-gray-900 min-w-[180px]">
              {view === 'month' && `${MONTH_NAMES[month]} ${year}`}
              {view === 'week' && (() => {
                const s = new Date(year, month, weekStart)
                const e = new Date(s)
                e.setDate(e.getDate() + 6)
                return `${MONTH_NAMES[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${e.getDate()}, ${year}`
              })()}
              {view === 'agenda' && (() => {
                const s = new Date(year, month, weekStart)
                const e = new Date(s)
                e.setDate(e.getDate() + 15)
                return `Today ${MONTH_NAMES[s.getMonth()].slice(0, 3)} ${s.getDate()}, ${year} - ${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getDate()}, ${year}`
              })()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${view === 'week' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${view === 'month' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${view === 'agenda' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Agenda
            </button>
            <button
              onClick={() => openAddEvent()}
              className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Add event"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* View content */}
        <div className="flex-1 overflow-auto p-6">
          {view === 'month' && (
            <MonthView
              year={year}
              month={month}
              firstDay={firstDay}
              daysInMonth={daysInMonth}
              today={today}
              eventsByDay={eventsByDay}
              onDayClick={(d) => {
                setWeekStart(d)
                setView('agenda')
              }}
              onEventClick={openEditEvent}
            />
          )}
          {view === 'week' && (
            <WeekView
              weekStartDate={weekStartDate}
              today={today}
              events={weekEvents}
              onEventClick={openEditEvent}
            />
          )}
          {view === 'agenda' && (
            <AgendaView
              events={agendaEvents}
              onEventClick={openEditEvent}
            />
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="w-64 border-l border-gray-200 bg-gray-50 shrink-0 flex flex-col overflow-hidden">
        <div className="p-4">
          <MiniCalendar
            year={year}
            month={month}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            selectedDate={view === 'week' || view === 'agenda' ? new Date(year, month, weekStart) : null}
            weekStart={view === 'week' ? weekStart : null}
          />
        </div>
      </aside>

      {/* Edit Event Modal */}
      {editModalOpen && (
        <EditEventModal
          event={editEvent}
          calendars={calendars}
          onClose={() => {
            setEditModalOpen(false)
            setEditEvent(null)
          }}
          onSubmit={() => {
            setEditModalOpen(false)
            setEditEvent(null)
          }}
        />
      )}
    </div>
  )
}

function MiniCalendar({ year, month, onMonthChange, selectedDate, weekStart }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`pad-${i}`} className="h-6" />)
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    const isSelected = selectedDate && d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
    const inWeek = weekStart && d >= weekStart && d < weekStart + 7
    cells.push(
      <div
        key={d}
        className={`h-6 flex items-center justify-center text-xs rounded cursor-pointer ${
          isSelected ? 'bg-blue-500 text-white' : inWeek ? 'bg-blue-100' : isToday ? 'bg-gray-200' : 'hover:bg-gray-100'
        }`}
      >
        {d}
      </div>,
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onMonthChange(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium">{MONTH_NAMES[month]} {year}</span>
        <button
          onClick={() => onMonthChange(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-gray-500">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">{cells}</div>
    </div>
  )
}

function MonthView({ year, month, firstDay, daysInMonth, today, eventsByDay, onDayClick, onEventClick }) {
  const weeks = []
  let day = 1
  for (let week = 0; week < 6; week += 1) {
    const cells = []
    for (let dow = 0; dow < 7; dow += 1) {
      if ((week === 0 && dow < firstDay) || day > daysInMonth) {
        cells.push(<div key={`e-${week}-${dow}`} className="min-h-[80px] p-2 border border-gray-200 bg-gray-50/50" />)
      } else {
        const key = `${year}-${month}-${day}`
        const dayEvents = eventsByDay[key] || []
        const isToday =
          day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
        cells.push(
          <div
            key={`d-${day}`}
            onClick={() => onDayClick(day)}
            className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
              isToday ? 'bg-blue-50/50' : ''
            }`}
          >
            <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {day}
            </div>
            <div className="mt-1 space-y-0.5">
              {dayEvents.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    onEventClick(e)
                  }}
                  className="flex items-center gap-1 text-xs truncate rounded px-1 py-0.5 text-white"
                  style={{ backgroundColor: e.color }}
                  title={e.title}
                >
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{e.title}</span>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>,
        )
        day += 1
      }
    }
    weeks.push(
      <div key={`w-${week}`} className="grid grid-cols-7 gap-1">
        {cells}
      </div>,
    )
    if (day > daysInMonth) break
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES_SHORT.map((d) => (
          <div key={d} className="text-center font-semibold text-gray-600 py-2 text-sm">
            {d}
          </div>
        ))}
      </div>
      <div className="space-y-1">{weeks}</div>
    </div>
  )
}

function WeekView({ weekStartDate, today, events, onEventClick }) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  const hours = ['all-day', '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am']

  const allDayEvents = events.filter((e) => !e.dueTime || e.dueTime === '11:59pm')

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-8 gap-px border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-2" />
        {days.map((d) => {
          const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          return (
            <div
              key={d.toISOString()}
              className={`p-2 text-center text-sm font-medium ${isToday ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-700'}`}
            >
              {DAY_NAMES_SHORT[d.getDay()]} {d.getMonth() + 1}/{d.getDate()}
            </div>
          )
        })}
        {/* All-day row */}
        <div className="bg-gray-50 p-2 text-xs text-gray-500">all-day</div>
        {days.map((d) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
          const dayEvents = events.filter(
            (e) =>
              e.date.getFullYear() === d.getFullYear() &&
              e.date.getMonth() === d.getMonth() &&
              e.date.getDate() === d.getDate(),
          )
          return (
            <div key={key} className="min-h-[40px] p-1 bg-gray-50/50 border-t border-gray-100">
              {dayEvents.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onEventClick(e)}
                  className="text-xs truncate rounded px-1 py-0.5 mb-0.5 cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: e.color, color: 'white' }}
                  title={e.title}
                >
                  {e.title}
                </div>
              ))}
            </div>
          )
        })}
        {/* Time slots */}
        {hours.slice(1).map((h) => (
          <React.Fragment key={h}>
            <div className="bg-gray-50 p-1 text-xs text-gray-500 border-t border-gray-100">{h}</div>
            {days.map((d) => (
              <div key={`${d.toISOString()}-${h}`} className="min-h-[32px] border-t border-gray-100" />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function AgendaView({ events, onEventClick }) {
  const byDate = {}
  events.forEach((e) => {
    const key = e.date.toDateString()
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(e)
  })
  const sortedDates = Object.keys(byDate).sort()

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr) => {
        const d = new Date(dateStr)
        const dayEvents = byDate[dateStr]
        return (
          <div key={dateStr}>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {DAY_NAMES_SHORT[d.getDay()]}, {MONTH_NAMES[d.getMonth()].slice(0, 3)} {d.getDate()}
            </div>
            <div className="space-y-1">
              {dayEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onEventClick(e)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors border border-transparent hover:border-gray-200"
                >
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Due {e.dueTime || '11:59pm'}</div>
                    <div className="font-medium text-gray-900 truncate">{e.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {sortedDates.length === 0 && (
        <p className="text-sm text-gray-500">No events in this range.</p>
      )}
    </div>
  )
}

function EditEventModal({ event, calendars, onClose, onSubmit }) {
  const [activeTab, setActiveTab] = useState('event')
  const [form, setForm] = useState({
    title: event?.title || '',
    date: event?.date ? event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '',
    from: event?.from || '',
    to: event?.to || '',
    frequency: event?.frequency || 'Does not repeat',
    location: event?.location || '',
    calendarId: event?.calendarId || 'personal',
  })

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        date: event.date ? event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '',
        from: event.from || event.dueTime || '',
        to: event.to || '',
        frequency: event.frequency || 'Does not repeat',
        location: event.location || '',
        calendarId: event.calendarId || 'personal',
      })
    }
  }, [event])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('event')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'event' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Event
          </button>
          <button
            onClick={() => setActiveTab('todo')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'todo' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            My To Do
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Input Event Title..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Start Time</option>
                <option value="11:59pm">11:59pm</option>
                <option value="12:00am">12:00am</option>
                <option value="9:00am">9:00am</option>
                <option value="10:00am">10:00am</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">End Time</option>
                <option value="11:59pm">11:59pm</option>
                <option value="12:00am">12:00am</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Does not repeat</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="Input Event Location..."
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calendar</label>
            <select
              value={form.calendarId}
              onChange={(e) => setForm((f) => ({ ...f, calendarId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
