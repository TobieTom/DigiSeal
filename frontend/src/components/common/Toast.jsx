// src/components/common/Toast.jsx
import React, { useState, useEffect, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useRecoilState } from 'recoil'
import { toastState } from '../../store/atoms'
import '../../styles/toast.css'
import '../../styles/transitions.css'

function Toast() {
    const [toast, setToast] = useRecoilState(toastState)
    const [show, setShow] = useState(false)
    const nodeRef = useRef(null) // Add ref to avoid findDOMNode

    // Function to clear toast content after animation ends
    function clearToast() {
        setShow(false)
        setTimeout(() => {
            setToast('')
        }, 300)
    }

    useEffect(() => {
        if (toast) {
            setShow(true)
            // Auto-clear toast after 3 seconds
            const timer = setTimeout(() => {
                clearToast()
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [toast])

    return (
        <div className="toast-container">
            <CSSTransition
                nodeRef={nodeRef} // Pass ref to CSSTransition
                in={show}
                classNames="toast-transition"
                timeout={300}
                unmountOnExit
            >
                <div ref={nodeRef} className="toast-message">
                    <p>{toast}</p>
                    <button onClick={clearToast} className="toast-close-btn">×</button>
                </div>
            </CSSTransition>
        </div>
    )
}

export default Toast