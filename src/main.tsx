import ReactDOM from "react-dom/client";
import "./assets/global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import rootRoute from "./pages";
import { WagmiRoot } from "./hooks";
import ToastRoot from "./hooks/ctx/ToastRoot";
import { StoreProvider } from "@/store";

const router = createBrowserRouter(rootRoute, {
  basename: import.meta.env.BASE_URL,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <WagmiRoot>
      <ToastRoot />
      <RouterProvider router={router} />
    </WagmiRoot>
  </StoreProvider>
);
