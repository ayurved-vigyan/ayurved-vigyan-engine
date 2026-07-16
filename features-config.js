f25: (boxElement) => {
    const isAdmin = window.location.search.includes('admin=true');
    const wrapper = document.createElement("div");
    wrapper.className = "payment-engine-container p-4 bg-white rounded-xl shadow-lg border border-purple-200 mt-4";
    
    // UI Render Function
    const renderUI = () => {
        wrapper.innerHTML = `
            <div class="flex justify-between items-center mb-4 border-b pb-2">
                <h2 class="text-xl font-bold text-purple-800">${isAdmin ? '🛠️ Master Admin Dashboard' : '💳 Payment Hub'}</h2>
                <button class="menu-trigger text-2xl font-bold p-2 text-gray-600">⠿</button>
            </div>
            <div class="dropdown-menu hidden bg-white border rounded shadow-xl p-2 z-50 absolute right-4">
                <button class="btn-manage block w-full text-left px-4 py-2 hover:bg-gray-100">${isAdmin ? '🛠️ Admin Panel' : '💳 Manage Payments'}</button>
            </div>
            <div class="modal-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="modal-content bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    ${isAdmin ? getAdminUI() : getUserFormUI()}
                </div>
            </div>
        `;
    };

    const getUserFormUI = () => `
        <div class="space-y-4">
            <h3 class="text-lg font-bold text-purple-700 underline">Primary Verification</h3>
            <input type="text" placeholder="Full Name (Bank Records)" class="w-full p-2 border rounded">
            <input type="tel" placeholder="Mobile Number" class="w-full p-2 border rounded">
            <input type="email" placeholder="Email Address" class="w-full p-2 border rounded">
            
            <h3 class="text-lg font-bold text-purple-700 underline">UPI Management</h3>
            <div class="upi-slots space-y-2">
                <button class="add-upi-btn bg-purple-900 text-white p-2 rounded w-full">+ Add Multiple UPI ID</button>
            </div>
            
            <h3 class="text-lg font-bold text-purple-700 underline">Bank Details</h3>
            <input type="text" placeholder="Account Number" class="w-full p-2 border rounded">
            <input type="text" placeholder="Confirm Account Number" class="w-full p-2 border rounded">
            <div class="flex gap-2">
                <input type="text" placeholder="IFSC Code" class="w-full p-2 border rounded ifsc-field">
                <button class="fetch-ifsc bg-blue-600 text-white px-4 rounded">🔍 Fetch</button>
            </div>
            <select class="w-full p-2 border rounded"><option>Savings Account</option><option>Current Account</option></select>
            
            <div class="grid grid-cols-2 gap-2 mt-4">
                <button class="save-payment bg-green-600 text-white p-2 rounded font-bold">💾 SAVE & SUBMIT</button>
                <button class="update-sync bg-sky-500 text-white p-2 rounded font-bold">🔄 UPDATE & SYNC</button>
            </div>
            <label class="flex items-center gap-2 mt-2 font-semibold text-orange-600"><input type="checkbox" checked> Master Payment Toggle (ON)</label>
            <button class="close-modal w-full py-2 bg-red-600 text-white rounded mt-2 font-bold">⚠️ DELETE ALL METHODS</button>
        </div>
    `;

    const getAdminUI = () => `
        <div class="space-y-4">
            <div class="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                <div class="bg-black text-white p-1">TOTAL</div><div class="bg-green-600 text-white p-1">ACTIVE</div>
                <div class="bg-yellow-500 p-1">PAUSED</div><div class="bg-red-600 text-white p-1">BLOCKED</div>
            </div>
            <input type="text" placeholder="🔍 Search Users (Name/Email/UPI)..." class="w-full p-2 border rounded">
            <div class="admin-table border p-2 text-sm overflow-x-auto">
                <table class="w-full border-collapse"><thead><tr><th>User</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td>USR101</td><td>🟢</td><td><button class="quick-edit bg-purple-700 text-white px-2 rounded">⚙️ Quick Edit</button></td></tr></tbody></table>
            </div>
            <div class="border-t pt-2 space-y-2">
                <label class="flex items-center gap-2 font-bold text-red-600"><input type="checkbox" class="block-toggle"> MASTER BLOCK/UNBLOCK</label>
                <select class="w-full p-1 border rounded"><option>Set Status (Active/Paused/Deleted)</option></select>
                <textarea placeholder="Internal Audit Notes..." class="w-full border p-2 text-xs"></textarea>
                <button class="bg-green-600 text-white w-full py-2 font-bold">💾 SYNC & SAVE TO SHEET</button>
            </div>
            <button class="close-modal w-full py-2 bg-gray-500 text-white rounded">Close Admin Panel</button>
        </div>
    `;

    renderUI();
    boxElement.appendChild(wrapper);

    // Event Handling
    boxElement.addEventListener("click", async (e) => {
        if (e.target.matches(".menu-trigger")) wrapper.querySelector(".dropdown-menu").classList.toggle("hidden");
        if (e.target.matches(".btn-manage")) wrapper.querySelector(".modal-overlay").classList.remove("hidden");
        if (e.target.matches(".close-modal")) wrapper.querySelector(".modal-overlay").classList.add("hidden");
        
        // UPI Dynamic Logic
        if (e.target.matches(".add-upi-btn")) {
            const div = document.createElement("div");
            div.className = "flex gap-2 items-center p-1 border rounded bg-gray-50";
            div.innerHTML = `
                <input placeholder="user@upi" class="flex-1 p-1 border rounded text-xs">
                <label class="text-[9px] text-center">Primary<br><input type="radio" name="upi-primary"></label>
                <input type="checkbox" checked title="Toggle Status">
                <button class="delete-upi text-red-500 font-bold">🗑️</button>
            `;
            wrapper.querySelector(".upi-slots").appendChild(div);
        }
        if (e.target.matches(".delete-upi")) e.target.parentElement.remove();
        
        // IFSC API Integration
        if (e.target.matches(".fetch-ifsc")) {
            const ifsc = wrapper.querySelector(".ifsc-field").value;
            if (ifsc) {
                try {
                    const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
                    const data = await res.json();
                    alert(`Bank: ${data.BANK}, Branch: ${data.BRANCH}`);
                } catch (err) { alert("Invalid IFSC Code"); }
            }
        }
    });

    return () => wrapper.remove();
},
