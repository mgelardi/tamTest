# PayPal Integration Demo – Multi-Phase Project

This repository showcases a progressive integration of the PayPal Checkout system across three phases, each increasing in complexity and functionality. It demonstrates real-world use cases like capturing payments, offering card-based checkout, and processing refunds through a simulated back-office system.

---

## How to Use

Each phase is self-contained. Start with Phase 1 and move forward:

### Prerequisites

- [Node.js](https://nodejs.org/)
- PayPal Sandbox account
- PayPal developer app with `client_id` and `secret`
- VS Code + Live Server (for frontend preview, optional)

### Testing Mode

All phases use the **PayPal Sandbox environment**. Ensure you have:

- A **Sandbox Business Account** to receive payments.
- A **Sandbox Personal Account** to simulate the buyer.

---

## Project Phases

### [Phase 1 – Basic PayPal Button](./paypal-phase-1/)

- HTML/JS only
- No backend
- Demonstrates minimal integration using Smart Payment Buttons

### [Phase 2 – Unified Checkout (PayPal + Card)](./paypal-phase-2/)

- Collects buyer information
- Presents PayPal and Card buttons
- Captures order using backend with REST API v2

### [Phase 3 – Refund System](./paypal-phase-3/)

- Adds refund functionality for captured orders
- Simulates a back-office environment
- Issues full (and extendable to partial) refunds

---

## License

This project is intended for **demo and educational purposes only**.

---

## Author

**Michelangelo Gelardi**  
GitHub: [@mgelardi](https://github.com/mgelardi)  
