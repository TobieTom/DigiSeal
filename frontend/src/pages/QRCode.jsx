import { useParams } from 'react-router-dom'
import QRCodeComponent from 'react-qr-code'
import '../styles/qrcode.css'

function QRCode() {
    const { id } = useParams()

    return (
        <div className="qrcode-page">
            <h2 className="success-message">PRODUCT ADDED SUCCESSFULLY!</h2>

            <div className="qrcode-container">
                <QRCodeComponent value={id || ''} size={256} />
            </div>

            <div className="qrcode-info">
                <h3>PRODUCT QR CODE</h3>
                <p>Scan this QR code to verify product authenticity.</p>
                <p className="product-id">Product ID: {id}</p>
            </div>
        </div>
    )
}

export default QRCode