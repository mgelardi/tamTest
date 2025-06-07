// Mock orders – in real case, fetch from your backend or PayPal API
const mockOrders = [
  { orderId: "1", captureId: "48K790888W874551J", status: "COMPLETED", amount: "50.00" },
  { orderId: "2", captureId: "3R450992TN236841B", status: "PENDING", amount: "50.00" },
  { orderId: "3", captureId: "9K991743HF364193K", status: "COMPLETED", amount: "30.00" }
];

const listContainer = document.getElementById("order-list");

function renderOrders(orders) {
  listContainer.innerHTML = "";

  orders.forEach(order => {
    if (order.status !== "COMPLETED") return;

    const div = document.createElement("div");
    div.className = "order";
    div.innerHTML = `
      <h3>Order ID: ${order.orderId}</h3>
      <p>Status: ${order.status}</p>
      <p>Capture ID: ${order.captureId}</p>
      <p>Amount: $${order.amount}</p>
      <button onclick="refundOrder('${order.captureId}')">Refund Order</button>
    `;
    listContainer.appendChild(div);
  });

  if (!listContainer.hasChildNodes()) {
    listContainer.innerHTML = "<p>No completed orders to refund.</p>";
  }
}

async function refundOrder(captureId) {
  try {
    const res = await fetch("http://localhost:4000/api/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captureId })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Refund ID: ${data.refundId}`);
    } else {
      console.error("Refund error:", data);
      alert(`Refund failed: ${data.message}`);
    }
  } catch (err) {
    console.error("Refund request failed:", err);
    alert("Refund request failed.");
  }
}

// Simulate loading
setTimeout(() => renderOrders(mockOrders), 500);