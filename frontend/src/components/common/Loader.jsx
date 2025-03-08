import React from 'react'
import '../../styles/loader.css'

function Loader({ size }) {
if (size === 'fix') {
    return (
    <div className="loader-container-fixed">
        <div className="loader"></div>
    </div>
    )
} else if (size === 'normal') {
    return (
    <div className="loader-container">
        <div className="loader"></div>
    </div>
    )
}

return (
    <div className="loader-container-fullscreen">
    <div className="loader"></div>
    </div>
)
}

export default Loader