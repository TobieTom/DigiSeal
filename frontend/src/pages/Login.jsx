import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, toastState } from '../store/atoms'
import '../styles/forms.css'

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
    const setToast = useSetRecoilState(toastState)

    // Get the page the user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || '/'

    // Check if user is already logged in
    useEffect(() => {
        if (isLoggedIn) {
            setToast('Already logged in!')
            navigate('/')
        } else {
            setToast('Please login first!')
        }
    }, [])

    // Handle login
    const handleLogin = async () => {
        try {
            // This is a placeholder for actual blockchain authentication
            // We'll simulate a successful login for now
            setIsLoggedIn(true)
            localStorage.setItem('isLoggedIn', 'true')
            setToast('Logged in successfully')
            navigate(from)
        } catch (error) {
            console.error('Login error:', error)
            setToast('Login failed. Please try again.')
        }
    }

    return (
        <section className="form-section">
            <div className="form-container">
                <div className="form-frame">
                    <div className="login-box">
                        <h2>Login with Wallet</h2>
                        <p>Connect your wallet to authenticate and access the blockchain product verification system.</p>
                        <button className="btn btn-primary btn-lg" onClick={handleLogin}>
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login