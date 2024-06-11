import moment from "moment";

// AvailabilitiesMap {
//   '0' => { date: 2024-06-02T00:00:00.000Z, slots: [] }
// }
interface Availability {
  date: Date;
  slots: String[];
}
type AvailabilitiesMap = Map<string, Availability>;

export const getAvailabilities = (date: Date, numberOfDays = 7): AvailabilitiesMap => {
  const availabilities = new Map();

  for (let i = 0; i < numberOfDays; i++) {
    const tmpDate = moment(date).add(i, "days");
    availabilities.set(tmpDate.format("d"), {
      date: tmpDate.toDate(),
      slots: [],
    });
  }

  return availabilities;
};
