import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { SWRConfig } from "swr";
import { apiInstance } from "@/hooks/useApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <SWRConfig
            value={{
              fetcher: (url: string) => apiInstance.get(url).then((r) => r.data),
              onError: (err: any) => {
                const message =
                  err?.response?.data?.message ||
                  err?.message ||
                  "Something went wrong";
                toast.error(message);
              },
              shouldRetryOnError: false,
            }}
          >
            <>
              <App />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </>
          </SWRConfig>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
