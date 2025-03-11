import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { userRoleState, toastState } from '../store/atoms'
import blockchainService from '../services/BlockchainService'
import ipfsService from '../services/IPFSService'
import Loader from '../components/common/Loader'
import '../styles/products-list.css'

function ProductsList() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const userRole = useRecoilValue(userRoleState)
    const setToast = useSetRecoilState(toastState)
    const navigate = useNavigate()

    useEffect(() => {
        // Fetch products from blockchain
        const fetchProducts = async () => {
            try {
                setLoading(true)

                // Initialize blockchain service
                await blockchainService.init()

                let productIds = []
                const account = await blockchainService.getCurrentAccount()

                // Get different product lists based on user role
                if (userRole === 'manufacturer') {
                    productIds = await blockchainService.getProductsManufactured(account)
                } else {
                    productIds = await blockchainService.getProductsOwned(account)
                }

                // Fetch details for each product
                const productsList = []

                for (const id of productIds) {
                    try {
                        const productDetails = await blockchainService.getProductDetails(id)
                        let extendedInfo = {}

                        // Try to fetch extended info from IPFS
                        if (productDetails.productDetails && productDetails.productDetails.startsWith('Qm')) {
                            try {
                                extendedInfo = await ipfsService.getJSON(productDetails.productDetails)
                            } catch (ipfsError) {
                                console.error('Error fetching IPFS details:', ipfsError)
                            }
                        }

                        productsList.push({
                            id: id,
                            name: extendedInfo.name || productDetails.manufacturerName,
                            price: extendedInfo.price || 'N/A',
                            status: productDetails.status,
                            manufacturer: productDetails.manufacturerName,
                            manufactureDate: new Date(productDetails.manufactureDate).toLocaleDateString()
                        })
                    } catch (error) {
                        console.error(`Error fetching details for product ${id}:`, error)
                    }
                }

                setProducts(productsList)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching products:', error)
                setError('Failed to load products. Please try again.')
                setToast('Error loading products: ' + error.message)
                setLoading(false)
            }
        }

        fetchProducts()
    }, [userRole, setToast])

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`)
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div className="products-list-container">
            <div className="products-header">
                <h1>{userRole === 'manufacturer' ? 'My Manufactured Products' : 'My Products'}</h1>
                <p>
                    {userRole === 'manufacturer'
                        ? 'Manage and track your registered products'
                        : 'View and manage your owned products'}
                </p>
            </div>

            <div className="products-grid">
                {error ? (
                    <div className="error-message">{error}</div>
                ) : products.length === 0 ? (
                    <div className="no-products-message">
                        <p>You don't have any products yet.</p>
                        {userRole === 'manufacturer' && (
                            <button
                                className="action-button"
                                onClick={() => navigate('/add')}
                            >
                                Add Your First Product
                            </button>
                        )}
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
                                <p className="product-status">Status: {product.status}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ProductsList