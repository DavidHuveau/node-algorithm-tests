import getAvailabilities, { filterAvailabilitiesForNext7Days } from "./getAvailabilities";
import { describe, expect, test } from "@jest/globals";
import { Event } from "./type";
import moment from "moment";

const RECURRING_EVENTS: Event[] = [
  // past recurring
  {
    kind: "opening",
    starts_at: new Date("2014-08-04 09:30"), // Monday
    ends_at: new Date("2014-08-04 12:30"),
    weekly_recurring: true,
  },
  // past recurring
  {
    kind: "opening",
    starts_at: new Date("2014-07-28 09:00"), // Monday
    ends_at: new Date("2014-07-28 12:00"),
    weekly_recurring: true,
  },
  // future recurring
  {
    kind: "opening",
    starts_at: new Date("2014-08-18 08:00"), // Monday
    ends_at: new Date("2014-08-18 20:00"),
    weekly_recurring: true,
  },
];

const RECURRING_EVENT_IN_THE_WEEK: Event = {
  kind: "opening",
  starts_at: new Date("2014-08-11 08:00"), // Monday
  ends_at: new Date("2014-08-11 10:00"),
  weekly_recurring: true,
};

const NON_RECURRING_EVENTS: Event[] = [
  // past recurring
  {
    kind: "opening",
    starts_at: new Date("2014-08-04 08:00"), // Monday
    ends_at: new Date("2014-08-04 12:00"),
    weekly_recurring: false,
  },
  // past recurring
  {
    kind: "opening",
    starts_at: new Date("2014-07-28 09:00"), // Monday
    ends_at: new Date("2014-07-28 12:00"),
    weekly_recurring: false,
  },
  // future recurring
  {
    kind: "opening",
    starts_at: new Date("2014-08-18 08:00"), // Monday
    ends_at: new Date("2014-08-18 20:00"),
    weekly_recurring: false,
  },
];

const NON_RECURRING_EVENT_IN_THE_WEEK: Event = {
  kind: "opening",
  starts_at: new Date("2014-08-11 08:00"), // Monday
  ends_at: new Date("2014-08-11 10:00"),
  weekly_recurring: false,
};

describe("filterAvailabilitiesForNext7Days", () => {
  const testDate = new Date("2014-08-10"); // Sunday

  describe("with recurring events", () => {
    test("retrieves the nearest past event", () => {
      const result = filterAvailabilitiesForNext7Days(RECURRING_EVENTS, testDate);

      expect(result.length).toBe(1);
      expect(result[0].starts_at).toEqual(new Date("2014-08-11 09:30"));
      expect(result[0].ends_at).toEqual(new Date("2014-08-11 12:30"));
      expect(result[0].weekly_recurring).toEqual(true);
    });

    test("retrieves for the event in the current week", () => {
      const result = filterAvailabilitiesForNext7Days([...RECURRING_EVENTS, RECURRING_EVENT_IN_THE_WEEK], testDate);

      expect(result.length).toBe(1);
      expect(result).toEqual([RECURRING_EVENT_IN_THE_WEEK]);
    });
  });

  describe("with non recurring events", () => {
    test("retrieves for the event in the current week", () => {
      const result = filterAvailabilitiesForNext7Days([...NON_RECURRING_EVENTS, NON_RECURRING_EVENT_IN_THE_WEEK], testDate);

      expect(result.length).toBe(1);
      expect(result).toEqual([NON_RECURRING_EVENT_IN_THE_WEEK]);
    });
  });

  describe("with recurring events & non recurring events", () => {
    test("retrieves for the event in the current week", () => {
      const events = [...RECURRING_EVENTS, ...NON_RECURRING_EVENTS, RECURRING_EVENT_IN_THE_WEEK, NON_RECURRING_EVENT_IN_THE_WEEK];
      const result = filterAvailabilitiesForNext7Days(events, testDate);

      expect(result.length).toBe(2);
      expect(result).toEqual([NON_RECURRING_EVENT_IN_THE_WEEK, RECURRING_EVENT_IN_THE_WEEK]);
    });
  });
});

describe("getAvailabilities", () => {
  describe("without events", () => {
    const testDate = new Date("2014-08-10"); // Sunday

    test("no availabilities for the next 7 days", () => {
      const availabilities = getAvailabilities([], testDate);
      expect(availabilities.size).toBe(7);

      for (let i = 0; i < 7; i++) {
        const expectedDate = moment(testDate).add(i, "days").toDate();
        expect(availabilities.get(i.toString())?.date).toEqual(expectedDate);
        expect(availabilities.get(i.toString())?.slots).toEqual([]);
      }
    });

    describe("with events", () => {
      test("taking appointments into account when determining availabilities", () => {
        const events: Event[] = [
          {
            kind: "appointment",
            starts_at: new Date("2014-08-11 10:30"),
            ends_at: new Date("2014-08-11 11:30"),
          },
          {
            kind: "opening",
            starts_at: new Date("2014-08-04 09:30"),
            ends_at: new Date("2014-08-04 12:30"),
            weekly_recurring: true,
          },
        ];
        const availabilities = getAvailabilities(events, testDate);
        expect(availabilities.size).toBe(7);
        expect(availabilities.get("0")?.date.getTime()).toEqual(testDate.getTime());
        expect(availabilities.get("0")?.slots).toEqual([]);
        expect(availabilities.get("1")?.date.getTime()).toEqual(new Date("2014-08-11").getTime());
        expect(availabilities.get("1")?.slots).toEqual(["9:30", "10:00", "11:30", "12:00"]);
        expect(availabilities.get("2")?.slots).toEqual([]);
        expect(availabilities.get("3")?.slots).toEqual([]);
        expect(availabilities.get("4")?.slots).toEqual([]);
        expect(availabilities.get("5")?.slots).toEqual([]);
        expect(availabilities.get("6")?.slots).toEqual([]);
      });
    });
  });
});
