import { useNavigate } from "react-router";

function Dashboard() {
  const navigate =useNavigate();
  return (
    <>
      <body class="m-0 bg-[#f4f6f9]  text-[#333333]">
        <div class="mx-auto flex w-dvw flex-col gap-[25px]">
          <div class="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
            <div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <div class="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-xl bg-[#e8f8f0] text-xl text-[#20c997]">
                <i class="fa-solid fa-square-poll-vertical"></i>
              </div>

              <div class="flex flex-col">
                <span class="mb-1 text-[13px] font-medium text-[#8c8c8c]">
                  Total Revenue
                </span>

                <span class="mb-1 text-[22px] font-bold text-[#0f9f6e]">
                  Rs. 485,000
                </span>

                <span class="text-[11px] text-[#8c8c8c]">
                  <span class="font-semibold text-[#20c997]">
                    <i class="fa-solid fa-arrow-up-right-dots"></i>
                    12.5%
                  </span>
                  from last month
                </span>
              </div>
            </div>

            <div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <div class="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#ffeef0] text-xl text-[#ff4d4f]">
                <i class="fa-solid fa-arrow-down"></i>
              </div>

              <div class="flex flex-col cursor-pointer" onClick={() => navigate("/expenses")}>
                <span class="mb-1 text-[13px] font-medium text-[#8c8c8c]">
                  Total Expenses
                </span>

                <span class="mb-1 text-[22px] font-bold text-[#e02424]">
                  Rs. 182,500
                </span>

                <span class="text-[11px] text-[#8c8c8c]">
                  <span class="font-semibold text-[#20c997]">
                    <i class="fa-solid fa-arrow-up-right-dots"></i>
                    8.3%
                  </span>
                  from last month
                </span>
              </div>
            </div>

            <div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <div class="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#e8f8f0] text-xl text-[#20c997]">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </div>

              <div class="flex flex-col">
                <span class="mb-1 text-[13px] font-medium text-[#8c8c8c]">
                  Net Profit
                </span>

                <span class="mb-1 text-[22px] font-bold text-[#0f9f6e]">
                  Rs. 302,500
                </span>

                <span class="text-[11px] text-[#8c8c8c]">
                  <span class="font-semibold text-[#20c997]">
                    <i class="fa-solid fa-arrow-up-right-dots"></i>
                    15.7%
                  </span>
                  from last month
                </span>
              </div>
            </div>
            <div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <div class="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#fff8e6] text-xl text-[#faad14]">
                <i class="fa-regular fa-clock"></i>
              </div>

              <div class="flex flex-col">
                <span class="mb-1 text-[13px] font-medium text-[#8c8c8c]">
                  Pending Payments
                </span>

                <span class="mb-1 text-[22px] font-bold text-[#d97706]">
                  Rs. 45,000
                </span>

                <span class="text-[11px] text-[#8c8c8c]">
                  <span class="font-semibold text-[#20c997]">
                    <i class="fa-solid fa-arrow-up-right-dots"></i>
                    5.2%
                  </span>
                  from last month
                </span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-[25px] lg:grid-cols-[2fr_1fr]">
            <div class="flex flex-col gap-[25px]">
              <div class="flex items-center justify-start rounded-2xl bg-[#ff3b30] px-[30px] py-[50px] text-white shadow-[0_4px_15px_rgba(255,59,48,0.2)]">
                <h1 class="text-[38px] font-extrabold tracking-[-0.5px]">
                  Finance Management
                </h1>
              </div>

              <div class="rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                <div class="mb-5 flex items-center justify-between">
                  <h2 class="text-base font-bold text-[#1a1a1a]">
                    Recent Transactions
                  </h2>

                  <a
                    href="#"
                    class="text-xs font-semibold text-[#6366f1] no-underline"
                  >
                    View All
                  </a>
                </div>

                <div class="w-full overflow-x-auto">
                  <table class="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        <th class="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                          Date
                        </th>

                        <th class="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                          Description
                        </th>

                        <th class="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                          Category
                        </th>

                        <th class="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                          Amount
                        </th>

                        <th class="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Aug 24, 2025
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Product Sale - INV00123
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]"></td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#10b981]">
                          + Rs. 25,000
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#10b981]">
                          Paid
                        </td>
                      </tr>

                      <tr>
                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Aug 23, 2025
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Electricity Bill - JULY
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]"></td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#ef4444]">
                          - Rs. 8,500
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#10b981]">
                          Paid
                        </td>
                      </tr>

                      <tr>
                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Aug 22, 2025
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Supplier Payment - ABC Co.
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]"></td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#ef4444]">
                          - Rs. 15,000
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#f59e0b]">
                          Pending
                        </td>
                      </tr>

                      <tr>
                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Aug 21, 2025
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Salary - July 2025
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]"></td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#ef4444]">
                          - Rs. 50,000
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#10b981]">
                          Paid
                        </td>
                      </tr>

                      <tr>
                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Aug 20, 2025
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          Marketing - Facebook Ads
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 text-[#4b5563]"></td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#ef4444]">
                          - Rs. 6,000
                        </td>

                        <td class="border-b border-[#f9f9f9] py-4 font-semibold text-[#10b981]">
                          Paid
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-[25px]">
              <div class="flex flex-col items-center rounded-2xl bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                <div class="mb-5 flex w-full items-center justify-between">
                  <h2 class="text-base font-bold text-[#1a1a1a]">
                    Expense Breakdown
                  </h2>
                </div>

                <div class="relative my-[10px] mb-[25px] h-[200px] w-[200px]">
                  <div class="donut-chart flex h-full w-full items-center justify-center rounded-full">
                    <div class="flex h-[130px] w-[130px] flex-col items-center justify-center rounded-full bg-white text-center">
                      <span class="text-[15px] font-bold text-[#111827]">
                        Rs. 182,500
                      </span>

                      <span class="text-[11px] text-[#9ca3af]">
                        Total Expenses
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mb-[15px] flex w-full flex-col gap-3">
                  <div class="flex items-center justify-between text-xs text-[#4b5563]">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-[#6366f1]"></span>
                      Inventory
                    </span>

                    <span>Rs. 65,000</span>
                  </div>

                  <div class="flex items-center justify-between text-xs text-[#4b5563]">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-[#ef4444]"></span>
                      Salaries
                    </span>

                    <span>Rs. 50,000</span>
                  </div>

                  <div class="flex items-center justify-between text-xs text-[#4b5563]">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-[#10b981]"></span>
                      Utilities
                    </span>

                    <span>Rs. 22,500</span>
                  </div>

                  <div class="flex items-center justify-between text-xs text-[#4b5563]">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-[#f59e0b]"></span>
                      Marketing
                    </span>

                    <span>Rs. 18,000</span>
                  </div>

                  <div class="flex items-center justify-between text-xs text-[#4b5563]">
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-[#cbd5e1]"></span>
                      Other
                    </span>

                    <span>Rs. 27,000</span>
                  </div>
                </div>

                <button class="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-[#e5e7eb] bg-transparent px-[10px] py-[10px] text-xs text-[#6b7280] transition-colors duration-200 hover:bg-[#f9fafb]">
                  View Full Report
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>

              <div class="min-h-[180px] rounded-2xl bg-[#d1d5db] p-6">
                <h3 class="mb-[15px] text-base text-[#1f2937]">
                  Income vs Expense Summary
                </h3>

                <div class="flex flex-col gap-[10px] text-sm font-bold text-[#111827]">
                  <div class="flex gap-[10px]">
                    <span class="w-[100px]">This Month</span>
                  </div>

                  <div class="flex gap-[10px]">
                    <span class="w-[100px]">INCOME</span>

                    <span>:</span>
                  </div>

                  <div class="flex gap-[10px]">
                    <span class="w-[100px]">EXPENSES</span>

                    <span>:</span>
                  </div>

                  <div class="flex gap-[10px]">
                    <span class="w-[100px]">PROFIT</span>

                    <span>:</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </>
  );
}

export default Dashboard;
