import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import '../styles/products-list.css'

function ProductsList() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const setToast = useSetRecoilState(toastState)
    const navigate = useNavigate()

    useEffect(() => {
        // Fetch products - this is a placeholder for blockchain data fetching
        const fetchProducts = async () => {
            try {
                setLoading(true)

                // Simulate API call with timeout
                setTimeout(() => {
                    // Mock product data
                    const mockProducts = [
                        { id: 'prod001', name: 'Luxury Watch', price: '1999.99' },
                        { id: 'prod002', name: 'Designer Bag', price: '899.99' },
                        { id: 'prod003', name: 'Premium Sunglasses', price: '299.99' },
                        { id: 'prod004', name: 'Signature Perfume', price: '149.99' },
                        { id: 'prod005', name: 'Limited Edition Sneakers', price: '599.99' }
                    ]

                    setProducts(mockProducts)
                    setLoading(false)
                }, 1500)
            } catch (error) {
                console.error('Error fetching products:', error)
                setError('Failed to load products. Please try again.')
                setToast('Error loading products')
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const handleProductClick = (productId) => {
        navigate(`/productinfo/${productId}`)
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div className="products-list-container">
            <div className="products-header">
                <h1>Products You Own</h1>
                <p>Manage and track your registered products</p>
            </div>

            <div className="products-grid">
                {error ? (
                    <div className="error-message">{error}</div>
                ) : products.length === 0 ? (
                    <div className="no-products-message">
                        <p>You don't have any products yet.</p>
                        <button
                            className="action-button"
                            onClick={() => navigate('/add')}
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    products.map((product, index) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="product-number">{index + 1}</div>
                            <div className="product-info">
                                <h3 className="product-id">{product.id}</h3>
                                <p className="product-name">{product.name}</p>
                                <p className="product-price">${product.price}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ProductsList