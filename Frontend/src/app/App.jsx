// import AppRoutes from "./routes.jsx";

// function App() {
//   return <AppRoutes />
// }

// export default App

import { useEffect } from "react";
import AppRoutes from "./routes";
import { authApi } from "../features/auth/api/authApi";

function App() {
  useEffect(() => {
    const testLogin = async () => {
      try {
        const res = await authApi.login({
          email: "test@test.com",
          password: "123456",
        });

        console.log("LOGIN RESPONSE:", res);
      } catch (err) {
        console.error("LOGIN ERROR:", err);
      }
    };

    testLogin();
  }, []);

  return <AppRoutes />;
}

export default App;
