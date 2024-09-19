export type Availability = {
  date: Date;
  slots: String[];
};

export type Event = {
  kind: "appointment" | "opening";
  starts_at: Date;
  ends_at: Date;
  weekly_recurring?: boolean;
};

// AvailabilitiesMap {
//   '0' => { date: 2024-06-02T00:00:00.000Z, slots: [] }
// }
export type AvailabilitiesMap = Map<string, Availability>;
