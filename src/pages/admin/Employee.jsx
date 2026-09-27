import { useEffect, useState } from "react";
import {
  createEmployee,
  demoteEmployee,
  getEmployees,
  updateEmployeeRole,
} from "../../api/user";
import EmployeeFormModal from "../../components/admin/employees/EmployeeFormModal";
import EmployeeTable from "../../components/admin/employees/EmployeeTable";

function getCurrentUser() {
  try {
    return JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [busyID, setBusyID] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const currentUser = getCurrentUser();

  useEffect(() => {
    let isMounted = true;

    async function loadEmployees() {
      try {
        const loadedEmployees = await getEmployees();
        if (isMounted) setEmployees(loadedEmployees);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.response?.data?.message || "Unable to load employees.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEmployees();
    return () => {
      isMounted = false;
    };
  }, []);

  function openModal(mode, employee = null) {
    setError("");
    setNotice("");
    setSelectedEmployee(employee);
    setModalMode(mode);
  }

  async function handleSave(payload) {
    const employeeID = selectedEmployee?._id || "new";
    setBusyID(employeeID);
    setError("");
    setNotice("");

    try {
      if (modalMode === "edit") {
        const updatedEmployee = await updateEmployeeRole(selectedEmployee._id, payload.role);
        setEmployees((currentEmployees) => currentEmployees.map((employee) => employee._id === updatedEmployee._id ? updatedEmployee : employee));
        setNotice("Employee role updated successfully.");
      } else {
        const newEmployee = await createEmployee(payload);
        setEmployees((currentEmployees) => [...currentEmployees, newEmployee].sort((left, right) => left.name.localeCompare(right.name)));
        setNotice("Employee account created successfully.");
      }
      setModalMode(null);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save employee.");
    } finally {
      setBusyID(null);
    }
  }

  async function handleDelete(employee) {
    if (String(employee._id) === String(currentUser?.id)) return;
    if (!window.confirm(`Change ${employee.name} to a normal user?`)) return;

    setBusyID(employee._id);
    setError("");
    setNotice("");

    try {
      await demoteEmployee(employee._id);
      setEmployees((currentEmployees) => currentEmployees.filter((item) => item._id !== employee._id));
      setNotice(`${employee.name} is now a normal user.`);
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to remove employee access.");
    } finally {
      setBusyID(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <title>Employees | Kannangara Hardwares</title>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300"></p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">Employees</h1>
            <p className="mt-2 max-w-xl text-sm text-night-sky-200"></p>
          </div>
          <div className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 px-5 py-4 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">Employees</p>
            <p className="mt-1 text-2xl font-extrabold text-night-sky-500">{employees.length}</p>
          </div>
        </header>

        {(error || notice) && <div className="rounded-xl border border-night-sky-200/30 bg-night-sky-100/10 px-4 py-3 text-sm text-night-sky-400" role="status">{error || notice}</div>}

        <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-base font-bold text-night-sky-500">Employee directory</h2>
              <p className="mt-1 text-xs text-night-sky-200">Select an employee to edit their responsibility level.</p>
            </div>
            <button type="button" onClick={() => openModal("add")} className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400">
              <i className="fa-solid fa-plus mr-2" aria-hidden="true" />Add employee
            </button>
          </div>
          <EmployeeTable employees={employees} isLoading={isLoading} busyID={busyID} currentUserID={currentUser?.id} onSelect={(employee) => openModal("edit", employee)} onDelete={handleDelete} />
        </section>
      </div>
      {modalMode && <EmployeeFormModal key={`${modalMode}-${selectedEmployee?._id || "new"}`} mode={modalMode} employee={selectedEmployee} isSaving={Boolean(busyID)} error={error} onClose={() => setModalMode(null)} onSubmit={handleSave} />}
    </main>
  );
}

export default Employee;
