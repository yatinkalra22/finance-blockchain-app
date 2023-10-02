import { v4 as uuidv4 } from "uuid";

export function getMachineId() {
  let machineId = localStorage.getItem("machineId");
  if (!machineId) {
    machineId = uuidv4();
    localStorage.setItem("machineId", machineId);
  }
  return machineId;
}
