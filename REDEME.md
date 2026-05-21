# Expense Splitter MVP 

A lightweight,and highly scalable RESTful API  built with **Node.js, Express, and SQLite3**. This application handles multi-currency expense distribution, time-segmented transaction histories, and real-time ledger balance calculations.

## Features Implemented

### User Management

* **Account Creation & Sign-In:** Seamless onboarding with email, password, and custom default base currencies.
* **Profile Configuration:** View and update registered profile attributes like active emails and currency preferences.
* **Cascade Deletion:** Permanently wipes out profile records while safely purging associated database references to prevent data corruption.

###  Expense Handling

* **Add Expense & Auto-Split:** Evenly divides multi-member bill payloads among registered user ID arrays.
* **Full REST CRUD Support:** View, modify, or delete single invoices with real-time balance updates.
* **Time-Segmented Activity Logs:** Aggregates shared transaction logs into `currentMonth`, `lastMonth`, and `customRangeOrOther` buckets automatically based on transaction dates.

###  Balance Analytics Engine

* **Net Balances Calculation:** Evaluates cross-user debt metrics across distinct global currencies (shows exactly who you owe or who owes you).
* **Monthly Email Statements:** Compiles real-time debt structures directly into a structured HTML template layout prepared for server mail.

##  Technical Architecture & Directory Structure

This project follows an organized, industry-standard **MVC pattern** separating database schemas, endpoint routers, and business logic:

```text
expense-splitter-mvp/
├── src/
│   ├── config/
│   │   └── database.js      # SQLite3 connection & table schema instantiation
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── expenseController.js
│   │   └── balanceController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── balanceRoutes.js
│   └── app.js           #Express                  # Environmental configuration parameters
├── package.json             # Engine script registry & project metadata
└── README.md                # System documentation

⚙️ Installation & Setup
1. Move Into Project Path Bash

** cd expense-splitter-mvp  **

2. Install Project Dependencies Bash

 ** npm install **

3. Set Up Environment Variables

Create a file named .env in the root folder of the project. This securely configures your local environment ports and security parameters:

Code snippet
PORT=3000

Bash
 ** npm run dev ** 

** API Testing Blueprint & Execution Guide  ** 

## Method,Endpoint Route,Full Request URL Users

POST,/api/users/account,http://localhost:3000/api/users/account
GET,/api/users/profile,http://localhost:3000/api/users/profile
PUT,/api/users/profile,http://localhost:3000/api/users/profile
DELETE,/api/users/account,http://localhost:3000/api/users/account

## Method,Endpoint Route,Full Request URL on expenses

POST,/api/expenses,http://localhost:3000/api/expenses
GET,/api/expenses/log,http://localhost:3000/api/expenses/log
GET,/api/expenses/:id,"http://localhost:3000/api/expenses/1 
PUT,/api/expenses/:id,http://localhost:3000/api/expenses/1
DELETE,/api/expenses/:id,http://localhost:3000/api/expenses/1

## Method ,Endpoint Route,Full Request URL on Balance

Method,Endpoint Route,Full Request URL
GET,/api/balances,http://localhost:3000/api/balances
POST,/api/balances/report,http://localhost:3000/api/balances/report

##   Future Scalability & Enhancements

While this MVP fully delivers on all core architectural requirements using a simulated session design, it is designed with production scaling in mind. Future product updates would include transitioning from `X-User-ID` headers to a secure **JSON Web Token (JWT)** authentication system, implementing real-time transactional currency conversion using a live exchange rate API integration, and migrating the underlying SQLite3 data storage engine to a production-grade relational system like **PostgreSQL** to handle higher concurrent transaction loads.

---

##   License & Support
This project was developed strictly as a technical evaluation submission. For any setup issues or questions regarding endpoint implementation details during evaluation, please reach out via your designated recruitment contact channel.