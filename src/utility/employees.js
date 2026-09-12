export const employeeRoles = [
  { value: "cashier", label: "Cashier" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
];

export function getEmployeeRole(employee) {
  if (employee?.isMannager) return "manager";
  if (employee?.isAdmin) return "admin";
  return "cashier";
}

export function getEmployeeRoleLabel(employee) {
  return employeeRoles.find((role) => role.value === getEmployeeRole(employee))?.label;
}
