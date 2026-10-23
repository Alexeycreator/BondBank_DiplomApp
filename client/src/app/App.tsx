import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../shared/auth/AuthContext";
import { ToastProvider } from "../shared/notifications/ToastContext";
import Header from "../widgets/site-header/ui/Header";
import Footer from "../widgets/site-footer/ui/Footer";
import ServerHealthCheck from "../widgets/server-health-check/ui/ServerHealthCheck";
import { Breadcrumbs } from "../widgets/breadcrumbs/ui/Breadcrumbs";
import AppRouter from "./router";

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                        <div className="app">
                            <Header />
                            <main className="main" style={{ padding: "20px 40px" }}>
                                <Breadcrumbs />
                                <AppRouter />
                            </main>
                            <Footer />
                        </div>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
