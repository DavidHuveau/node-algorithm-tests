import moment from "moment";
import { AvailabilitiesMap, Event } from "./type";

export const filterAvailabilitiesForNext7Days = (events: Event[], startDate: Date): Event[] => {
  const filteredEvents: Event[] = [];
  const startMoment = moment(startDate);
  const nearestRecurringEventsByDayOfWeek: { [dayOfWeek: number]: Event } = {};

  events.forEach((event) => {
    if (event.kind !== "opening") return;

    const eventStartMoment = moment(event.starts_at);

    if (event.weekly_recurring) {
      for (let i = 0; i < 7; i++) {
        const currentDay = startMoment.clone().add(i, "days");

        if (currentDay.isoWeekday() === eventStartMoment.isoWeekday()) {
          // sets both times to 00:00:00, so we can compare dates only
          if (eventStartMoment.startOf("day").isSameOrBefore(currentDay.startOf("day"))) {
            const existingEvent = nearestRecurringEventsByDayOfWeek[currentDay.isoWeekday()];

            if (!existingEvent || moment(existingEvent.starts_at).isBefore(eventStartMoment)) {
              nearestRecurringEventsByDayOfWeek[currentDay.isoWeekday()] = event;
            }
          }
        }
      }
    } else {
      if (
        eventStartMoment.startOf("day").isSameOrAfter(startMoment.startOf("day")) &&
        eventStartMoment.startOf("day").isBefore(startMoment.clone().add(7, "days").startOf("day"))
      ) {
        filteredEvents.push(event);
      }
    }
  });

  Object.values(nearestRecurringEventsByDayOfWeek).forEach((event) => {
    for (let i = 0; i < 7; i++) {
      const currentDay = startMoment.clone().add(i, "days");

      if (currentDay.isoWeekday() === moment(event.starts_at).isoWeekday()) {
        const recurringEventStart = currentDay.clone().set({
          hour: moment(event.starts_at).hour(),
          minute: moment(event.starts_at).minute(),
          second: moment(event.starts_at).second(),
        });
        const recurringEventEnd = recurringEventStart.clone().add(moment(event.ends_at).diff(event.starts_at));
        filteredEvents.push({
          ...event,
          starts_at: recurringEventStart.toDate(),
          ends_at: recurringEventEnd.toDate(),
        });
      }
    }
  });

  return filteredEvents;
};

const getAvailabilities = (events: Event[], date: Date): AvailabilitiesMap => {
  const availabilities = new Map();

  for (let i = 0; i < 7; ++i) {
    const tmpDate = moment(date).add(i, "days");
    availabilities.set(i.toString(), {
      date: tmpDate.toDate(),
      slots: [],
    });
  }

  const filtredEvents = filterAvailabilitiesForNext7Days(events, date);
  [...filtredEvents, ...events.filter((event) => event.kind === "appointment")].forEach((event) => {
    for (let date = moment(event.starts_at); date.isBefore(event.ends_at); date.add(30, "minutes")) {
      const day = availabilities.get(date.format("d"));
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
