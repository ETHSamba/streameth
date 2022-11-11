import { useState, useEffect, useMemo, useCallback } from 'react'
import { Session, Event } from 'types'
import { startOfDay, currentTimeInUTC } from 'utils/dateTime'
import useInterval from '@use-it/interval'

interface Filter {
  type: 'stage' | 'day'
  value: any
}

export type TimeState = 'BEFORE_EVENT' | 'DURING_DAY' | 'BEFORE_NEXT_DAY' | 'AFTER_EVENT'

export function useSessions(event: Event, initFilters: Filter[] = []) {
  const allSessions = event.schedule.sessions
  const [timeState, setTimeState] = useState<TimeState>('DURING_DAY')
  const [currentSession, setCurrentSession] = useState<Session>(allSessions[0])
  const [eventDayNum, setEventDayNum] = useState<number | null>(null)
  const [filters, setFilters] = useState<Filter[]>(initFilters)
  const eventDays = [...new Set(allSessions.map((i) => startOfDay(i.start)))].sort()

  const sessions = useMemo(() => {
    let filteredSessions = [...allSessions]

    return filteredSessions.filter((session) => {
      if (filters.length === 0) {
        return true
      }

      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i]
        const { type, value } = filter

        if (type === 'stage' && value !== session.stage) {
          return false
        }

        // eventDayNum is only set during the event; otherwise it is null
        // When null, use value of 0 to check the first day in eventDays
        // Otherwise, subtract 1 from eventDayNum to get corresponding index in eventDays
        if (type === 'day') {
          let v = 0

          if (value) {
            v = value - 1
          }

          if (eventDays[v] !== startOfDay(session.start)) {
            return false
          }
        }
      }

      return true
    }).sort((a: any, b: any) => a.start - b.start)
  }, [allSessions, filters, eventDays])

  // Determines when the user visits the website in relation to the event
  // Different timeStates are:
  //   - BEFORE_EVENT (before event starts)
  //   - DURING_DAY (during an event day)
  //   - BEFORE_NEXT_DAY (after all sessions in event day, but before event end)
  //   - AFTER_EVENT (after event end)
  // Also sets currentSession, which determines what session to initially show
  const calcTimeState = useCallback(
    () => {
      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i]
        const startTime = session.start
        const endTime = session.end
        const currentTime = currentTimeInUTC()

        if (currentTime.isBefore(startTime) && i === 0) {
          setCurrentSession(session)
          break
        } else if (currentTime.isBefore(endTime)) {
          setCurrentSession(session)

          if (startOfDay(currentTime) === startOfDay(endTime)) {
            setTimeState('DURING_DAY')
          } else {
            setTimeState('BEFORE_NEXT_DAY')
          }
          break
        } else if (i === sessions.length - 1) {
          setTimeState('AFTER_EVENT')
          setCurrentSession(sessions[0])
        }
      }
    },
    [sessions]
  )

  useEffect(() => {
    calcTimeState()
  }, [calcTimeState])

  // determine event day number if during event
  useEffect(() => {
    if (eventDays.length > 1) {
      for (let i = 0; i < eventDays.length; i++) {
        const day = eventDays[i]

        if (day === startOfDay(currentTimeInUTC())) {
          setEventDayNum(i + 1)
          break
        }
      }
    }
  }, [eventDays])

  // update time every minute and determine timeState
  // stop when timeState === BEFORE_NEXT_DAY or AFTER_EVENT
  useInterval(() => {
    calcTimeState()
  },
    ['BEFORE_NEXT_DAY', 'AFTER_EVENT'].includes(timeState) ? null : 60000 // time in ms
  )

  return {
    timeState,
    currentSession,
    eventDayNum,
    sessions,
    // addOrUpdateFilter,
    setFilters
  }
}
