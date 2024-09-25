import moment from "moment";
import { AvailabilitiesMap, Event } from "./type";

const addRecurringEvent = (event: Event, currentDay: moment.Moment, filteredEvents: Event[]): void => {
  const eventStartMoment = moment(event.starts_at);

  const recurringEventStart = currentDay.clone().set({
    hour: eventStartMoment.hour(),
    minute: eventStartMoment.minute(),
    second: eventStartMoment.second(),
  });
  const recurringEventEnd = recurringEventStart.clone().add(moment(event.ends_at).diff(event.starts_at));

  filteredEvents.push({
    ...event,
    starts_at: recurringEventStart.toDate(),
    ends_at: recurringEventEnd.toDate(),
  });
};

const handleWeeklyRecurringEvents = (
  event: Event,
  startMoment: moment.Moment,
  nearestRecurringEventsByDayOfWeek: { [dayOfWeek: number]: Event },
): void => {
  const eventStartMoment = moment(event.starts_at);
  for (let i = 0; i < 7; i++) {
    const currentDay = startMoment.clone().add(i, "days");

    if (currentDay.isoWeekday() === eventStartMoment.isoWeekday()) {
      if (eventStartMoment.startOf("day").isSameOrBefore(currentDay.startOf("day"))) {
        const existingEvent = nearestRecurringEventsByDayOfWeek[currentDay.isoWeekday()];

        if (!existingEvent || moment(existingEvent.starts_at).isBefore(eventStartMoment)) {
          nearestRecurringEventsByDayOfWeek[currentDay.isoWeekday()] = event;
        }
      }
    }
  }
};

const handleNonRecurringEvents = (event: Event, startMoment: moment.Moment, filteredEvents: Event[]): void => {
  const eventStartMoment = moment(event.starts_at);
  if (
    eventStartMoment.startOf("day").isSameOrAfter(startMoment.startOf("day")) &&
    eventStartMoment.startOf("day").isBefore(startMoment.clone().add(7, "days").startOf("day"))
  ) {
    filteredEvents.push(event);
  }
};

export const filterAvailabilitiesForNext7Days = (events: Event[], startDate: Date): Event[] => {
  const filteredEvents: Event[] = [];
  const startMoment = moment(startDate);
  const nearestRecurringEventsByDayOfWeek: { [dayOfWeek: number]: Event } = {};

  events.forEach((event) => {
    if (event.kind !== "opening") return;

    if (event.weekly_recurring) {
      handleWeeklyRecurringEvents(event, startMoment, nearestRecurringEventsByDayOfWeek);
    } else {
      handleNonRecurringEvents(event, startMoment, filteredEvents);
    }
  });

  Object.values(nearestRecurringEventsByDayOfWeek).forEach((event) => {
    for (let i = 0; i < 7; i++) {
      const currentDay = startMoment.clone().add(i, "days");
      const eventStartMoment = moment(event.starts_at);

      if (currentDay.isoWeekday() === eventStartMoment.isoWeekday()) {
        addRecurringEvent(event, currentDay, filteredEvents);
      }
    }
  });

  return filteredEvents;
};

const initializeAvailabilities = (dateMoment: moment.Moment): AvailabilitiesMap => {
  const availabilities = new Map();

  for (let i = 0; i < 7; ++i) {
    const tmpDate = dateMoment.clone().add(i, "days");
    availabilities.set(i.toString(), {
      date: tmpDate.toDate(),
      slots: [],
    });
  }
  return availabilities;
};

const getAvailabilities = (events: Event[], date: Date): AvailabilitiesMap => {
  const availabilities = initializeAvailabilities(moment(date));
  const filtredEvents = filterAvailabilitiesForNext7Days(events, date);

  [...filtredEvents, ...events.filter((event) => event.kind === "appointment")].forEach((event) => {
    for (let date = moment(event.starts_at); date.isBefore(event.ends_at); date.add(30, "minutes")) {
      const day = availabilities.get(date.format("d"));
      if (!day) return;

      if (event.kind === "opening") {
        day.slots.push(date.format("H:mm"));
      } else if (event.kind === "appointment") {
        day.slots = [...day.slots.filter((slot: string) => slot !== date.format("H:mm"))];
      }
    }
  });
  return availabilities;
};

export default getAvailabilities;
