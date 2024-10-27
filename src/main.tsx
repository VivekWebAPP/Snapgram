import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import QuaryProvider from './lib/react-quary/QuaryProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Router>
        <QuaryProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </QuaryProvider>
    </Router>
)