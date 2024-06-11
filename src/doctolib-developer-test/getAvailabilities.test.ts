import { getAvailabilities } from "./getAvailabilities";
import { describe, expect, test, beforeEach } from "@jest/globals";

describe("sum getAvailabilities", () => {
  describe("case 1", () => {
    test("test 1", () => {
      const availabilities = getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.size).toBe(7);
      expect(availabilities.get("0")?.date.toString()).toBe(new Date("2014-08-10").toString());

      for (let i = 0; i < 7; i++) {
        expect(availabilities.get(i.toString())?.slots).toEqual([]);
      }
    });
  });

  describe("case 2", () => {
    beforeEach(() => {
      // {
      //   kind: "appointment",
      //   starts_at: new Date("2014-08-11 10:30"),
      //   ends_at: new Date("2014-08-11 11:30")
      // },
      // {
      //   kind: "opening",
      //   starts_at: new Date("2014-08-04 09:30"),
      //   ends_at: new Date("2014-08-04 12:30"),
      //   weekly_recurring: true
      // }
    });

    test("test 1", () => {
      console.log("<ok>");
      // expect(add(1, 2)).toBe(3);
    });
  });
});
