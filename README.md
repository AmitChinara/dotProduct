# DotProduct

DotProduct is a full-stack personal finance management application. It helps you track your income and expenses, visualize your spending, set monthly budgets, and analyze your financial health with interactive charts.
---
## Screenshot
- **User Authentication:** Secure login/logout with token-based authentication.
- **Login:** Enter your username and password to access your dashboard.  
  📸 *Login Screen:*  
  ![Login Page](https://github.com/user-attachments/assets/fbb0a68b-9595-4593-8341-632825a6f3c9)
- **Category Management:** Organize transactions by customizable categories.
- **Income & Expense Tracking:** Add, edit, and delete transactions.  
  ![Add Transaction](https://github.com/user-attachments/assets/db35eae7-bb3d-4221-b4f4-a54c98dca7b0)  
  ![New Transaction](https://github.com/user-attachments/assets/e6635299-398c-4e2d-b4e3-6aef6c71b928)  
  ![Delete Transaction](https://github.com/user-attachments/assets/92581209-6542-4b64-8ea1-c9e96d0461c4)

- **Interactive Charts:** Visualize income and expenses by category and month using pie and bar charts.  
  ![Pie Chart](https://github.com/user-attachments/assets/8a0b6759-c711-4ad9-aa69-49d657b262e7)

- **Budgeting:** Set and compare monthly budgets against actual expenses.  
  ![Monthly Budget](https://github.com/user-attachments/assets/0e33b886-810e-48e1-a2ac-5d704bb15d1f)

- **Responsive UI:** Clean, modern interface with sticky balance and navigation.
- **Pagination & Filtering:** Easily browse and filter transactions.  
  ![Filter](https://github.com/user-attachments/assets/c5a1d6ca-34b4-474b-81e8-cc36ece7c5bb)
---

## Features

- **User Authentication:** Secure login/logout with token-based authentication.
- **Category Management:** Organize transactions by customizable categories.
- **Income & Expense Tracking:** Add, edit, and delete transactions.
- **Interactive Charts:** Visualize income and expenses by category and month using pie and bar charts.
- **Budgeting:** Set and compare monthly budgets against actual expenses.
- **Responsive UI:** Clean, modern interface with sticky balance and navigation.
- **Pagination & Filtering:** Easily browse and filter transactions.

---

## Tech Stack

- **Frontend:** React, Recharts, Axios
- **Backend:** Django, Django REST Framework, Token Authentication
- **Database:** SQLite (default, can be changed)
- **Other:** CSS for styling, React Icons

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Python 3.8+
- pip

### Backend Setup

1. **Install dependencies:**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

2. **Apply migrations:**
    ```bash
    python manage.py migrate
    ```

3. **Create a superuser (optional, for admin access):**
    ```bash
    python manage.py createsuperuser
    ```

4. **Run the backend server:**
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1. **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2. **Start the frontend development server:**
    ```bash
    npm start
    ```

3. The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Sample User Credentials

You can use these sample users to log in:

```json
{
  "username": "amit_chinara",
  "password": "Mohan@Lal#4"
}
```
```json
{
  "username": "ZendaCroX",
  "password": "Prof@WolF4"
}
```

---

## Usage

- **Login:** Enter your username and password to access your dashboard.
- **Add Transactions:** Click "New Transaction" to add income or expense.
- **Edit/Delete:** Select a transaction and use the edit or delete buttons.
- **Filter:** Use filters above the transaction table to narrow results.
- **Charts:** Click on pie chart slices for detailed breakdowns.
- **Budget:** Set your monthly budget and compare against actual expenses.

---

## Project Structure

```
dotProduct/
├── backend/      # Django backend (API, models, auth)
├── frontend/     # React frontend (components, charts, styles)
└── README.md
```

---

## Customization

- **API URLs:** All API endpoints are centralized in `frontend/src/constants/routes.js`.
- **Styling:** Modify `Dashboard.css` and `Login.css` for UI changes.
- **Database:** Default is SQLite; update Django settings for other databases.

---

## License

This project is for educational and personal use.

---

## Contact

For questions or suggestions, please contact the maintainer.

**Mobile:** +91 8093386767  
**Email:** amitchinara@gmail.com
