import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../shared/auth/AuthContext";
import { ToastProvider } from "../shared/notifications/ToastContext";
import Header from "../widgets/site-header/ui/Header";
import Footer from "../widgets/site-footer/ui/Footer";
import ServerHealthCheck from "../widgets/server-health-check/ui/ServerHealthCheck";
import { Breadcrumbs } from "../widgets/breadcrumbs/ui/Breadcrumbs";
import AppRouter from "./router";
import { ThemeProvider } from "../shared/theme/ThemeContext";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <div className="app">
                            <Header />
                            <main className="main">
                                <Breadcrumbs />
                                <AppRouter />
                            </main>
                            <Footer />
                        </div>
                    </BrowserRouter>
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
