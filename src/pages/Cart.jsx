function Cart() {
  return (
    <main class="max-w-5xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-semibold text-center text-slate-900 mb-6">Shopping Cart</h1>

      <div class="border border-gray-200 rounded-md overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 text-night-sky-500 text-left">
              <th class="py-4 px-6 font-semibold">Item</th>
              <th class="py-4 px-6 font-semibold text-center">Quantity</th>
              <th class="py-4 px-6 font-semibold text-right">
                Unit Price&nbsp;&nbsp;Rs.
              </th>
              <th class="py-4 px-6 font-semibold text-right">
                Total Price&nbsp;&nbsp;Rs.
              </th>
            </tr>
          </thead>
          <tbody class="text-slate-800">
            <tr class="bg-gray-100">
              <td class="py-4 px-6">Cement&nbsp;&nbsp;50kg</td>
              <td class="py-4 px-6 text-center">10</td>
              <td class="py-4 px-6 text-right">2500.00</td>
              <td class="py-4 px-6 text-right">25000.00</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="py-4 px-6">Cable Ties</td>
              <td class="py-4 px-6 text-center">1</td>
              <td class="py-4 px-6 text-right">20.00</td>
              <td class="py-4 px-6 text-right">20.00</td>
            </tr>
            <tr class="bg-gray-100">
              <td class="py-4 px-6">PVC Pipe&nbsp;&nbsp;20 m</td>
              <td class="py-4 px-6 text-center">2</td>
              <td class="py-4 px-6 text-right">800.00</td>
              <td class="py-4 px-6 text-right">1600.00</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="py-4 px-6">Angle Grinder</td>
              <td class="py-4 px-6 text-center">1</td>
              <td class="py-4 px-6 text-right">2500.00</td>
              <td class="py-4 px-6 text-right">8000.00</td>
            </tr>
            <tr class="bg-gray-100">
              <td class="py-4 px-6">Wall Plugs</td>
              <td class="py-4 px-6 text-center">5</td>
              <td class="py-4 px-6 text-right">1000.00</td>
              <td class="py-4 px-6 text-right">5000.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 bg-gray-100 rounded-md flex justify-between items-center px-6 py-4">
        <span class="font-medium text-night-sky-500">Total Amount</span>
        <span class="font-semibold text-slate-900">41600.00</span>
      </div>

      <div class="flex justify-center mt-8">
        <button class="bg-night-sky-500 hover:bg-night-sky-300 cursor-pointer text-white font-semibold px-8 py-3 rounded-md transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}

export default Cart;
