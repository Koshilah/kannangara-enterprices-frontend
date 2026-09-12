import { getEmployeeRoleLabel } from "../../../utility/employees";

function EmployeeTable({ employees, isLoading, busyID, currentUserID, onSelect, onDelete }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-180 border-collapse text-sm">
        <thead>
          <tr className="border-b border-night-sky-100/20 text-left text-xs uppercase tracking-wider text-night-sky-200">
            <th className="px-3 pb-3 font-bold">Name</th>
            <th className="px-3 pb-3 font-bold">Email</th>
            <th className="px-3 pb-3 font-bold">Role</th>
            <th className="px-3 pb-3 text-right font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="4" className="px-3 py-14 text-center text-night-sky-200">Loading employees...</td></tr>
          ) : employees.length === 0 ? (
            <tr><td colSpan="4" className="px-3 py-14 text-center text-night-sky-200">No employees found.</td></tr>
          ) : (
            employees.map((employee) => {
              const isBusy = busyID === employee._id;
              const isCurrentUser = String(employee._id) === String(currentUserID);
              return (
                <tr
                  key={employee._id}
                  tabIndex="0"
                  role="button"
                  onClick={() => onSelect(employee)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect(employee);
                  }}
                  className="cursor-pointer border-b border-night-sky-100/10 align-middle transition hover:bg-night-sky-100/10 focus:bg-night-sky-100/10 focus:outline-none"
                >
                  <td className="px-3 py-4 font-semibold text-night-sky-400">{employee.name}</td>
                  <td className="px-3 py-4 text-night-sky-300">{employee.email}</td>
                  <td className="px-3 py-4 font-bold text-night-sky-400">{getEmployeeRoleLabel(employee)}</td>
                  <td className="px-3 py-4 text-right">
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); onDelete(employee); }}
                      disabled={isBusy || isCurrentUser}
                      className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Remove employee access for ${employee.name}`}
                      title={isCurrentUser ? "You cannot remove your own access" : "Change to normal user"}
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
