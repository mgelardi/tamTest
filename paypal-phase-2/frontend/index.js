let buyerDetails = {};

document.getElementById("buyer-form").addEventListener("submit", (e) => {
  e.preventDefault();

  buyerDetails = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    address: {
      address_line_1: document.getElementById("address1").value,
      admin_area_2: document.getElementById("city").value,
      postal_code: document.getElementById("postal").value,
      country_code: document.getElementById("country").value.toUpperCase()
    }
  };

  document.getElementById("buyer-form").style.display = "none";
  document.getElementById("payment-section").style.display = "block";

  renderButtons();
});

function renderButtons() {
  paypal.Buttons({
    fundingSource: paypal.FUNDING.PAYPAL,
    style: { layout: 'vertical' },
    createOrder: async () => {
      const res = await fetch("http://localhost:4000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buyerDetails)
      });
      const data = await res.json();
      return data.id;
    },
    onApprove: async (data) => {
      const res = await fetch(`http://localhost:4000/api/capture-order/${data.orderID}`, {
        method: "POST"
      });
      const result = await res.json();
      alert(`PayPal payment captured! Order ID: ${result.orderID}`);
    }
  }).render("#paypal-button-container");

  paypal.Buttons({
    fundingSource: paypal.FUNDING.CARD,
    style: { layout: 'vertical' },
    createOrder: async () => {
      const res = await fetch("http://localhost:4000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buyerDetails)
      });
      const data = await res.json();
      return data.id;
    },
    onApprove: async (data) => {
      const res = await fetch(`http://localhost:4000/api/capture-order/${data.orderID}`, {
        method: "POST"
      });
      const result = await res.json();
      alert(`Card payment captured! Order ID: ${result.orderID}`);
    },
    onError: (err) => {
      console.error("Card Button Error:", err);
      alert("Card payment failed.");
    }
  }).render("#card-button-container");
}