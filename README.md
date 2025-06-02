# DotProduct

DotProduct is a full-stack personal finance management application. It helps you track your income and expenses, visualize your spending, set monthly budgets, and analyze your financial health with interactive charts.

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
