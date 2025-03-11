// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
/**
 * @title ProductVerification
 * @dev Contract for verifying authentic products and tracking ownership
 */
contract ProductVerification is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");

    // Product status
    enum ProductStatus {
        Created,
        InTransit,
        WithSeller,
        Sold,
        Reported
    }

    // Product struct
    struct Product {
        string productId; // Unique identifier for the product
        address manufacturer; // Address of the manufacturer
        address currentOwner; // Current owner of the product
        uint256 manufactureDate; // Date of manufacture (timestamp)
        string manufacturerName; // Name of the manufacturer
        string productDetails; // IPFS hash of product details (specs, etc.)
        string manufacturingLocation; // Location where the product was made
        ProductStatus status; // Current status of the product
        bool isAuthentic; // Flag to determine if product is authentic
    }

    // Transfer struct
    struct Transfer {
        address from;
        address to;
        uint256 timestamp;
        string transferConditions; // Optional data about transfer conditions
    }

    // Verification struct
    struct Verification {
        address verifier;
        uint256 timestamp;
        string location;
        bool result;
    }

    // Counterfeit report struct
    struct CounterfeitReport {
        address reporter;
        uint256 timestamp;
        string evidenceHash; // IPFS hash of photographic evidence
        string description; // Description of authenticity concerns
        string location; // Location where counterfeit was found
        bool resolved; // Flag to track resolution status
    }

    // Mappings
    mapping(string => Product) private products;
    mapping(string => Transfer[]) private transferHistory;
    mapping(string => Verification[]) private verificationHistory;
    mapping(string => CounterfeitReport[]) private counterfeitReports;
    mapping(address => bool) private authorizedSellers;
    mapping(address => string[]) private productsManufactured;
    mapping(address => string[]) private productsOwned;

    // Events
    event ProductRegistered(
        string productId,
        address manufacturer,
        string manufacturerName
    );
    event ProductVerified(string productId, address verifier, bool authentic);
    event OwnershipTransferred(string productId, address from, address to);
    event CounterfeitReported(string productId, address reporter);
    event SellerRegistered(address seller);

    // Constructor
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MANUFACTURER_ROLE, msg.sender);
    }

    // Modifiers
    modifier onlyManufacturer() {
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "Caller is not a manufacturer"
        );
        _;
    }

    modifier onlySellerOrManufacturer() {
        require(
            hasRole(SELLER_ROLE, msg.sender) ||
                hasRole(MANUFACTURER_ROLE, msg.sender),
            "Caller is not a seller or manufacturer"
        );
        _;
    }

    modifier productExists(string memory productId) {
        require(
            bytes(products[productId].productId).length > 0,
            "Product does not exist"
        );
        _;
    }

    modifier isProductOwner(string memory productId) {
        require(
            products[productId].currentOwner == msg.sender,
            "Caller is not the product owner"
        );
        _;
    }

    // Functions
    /**
     * @dev Register a new product
     */
    function registerProduct(
        string memory productId,
        string memory manufacturerName,
        string memory productDetails,
        string memory manufacturingLocation
    ) public onlyManufacturer nonReentrant returns (bool) {
        require(
            bytes(products[productId].productId).length == 0,
            "Product already exists"
        );

        products[productId] = Product({
            productId: productId,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            manufactureDate: block.timestamp,
            manufacturerName: manufacturerName,
            productDetails: productDetails,
            manufacturingLocation: manufacturingLocation,
            status: ProductStatus.Created,
            isAuthentic: true
        });

        productsManufactured[msg.sender].push(productId);
        productsOwned[msg.sender].push(productId);

        emit ProductRegistered(productId, msg.sender, manufacturerName);
        return true;
    }

    /**
     * @dev Register a new seller
     */
    function registerSeller(
        address seller
    ) public onlyManufacturer returns (bool) {
        require(!hasRole(SELLER_ROLE, seller), "Address is already a seller");

        grantRole(SELLER_ROLE, seller);
        authorizedSellers[seller] = true;

        emit SellerRegistered(seller);
        return true;
    }

    /**
     * @dev Transfer product ownership
     */
    function transferOwnership(
        string memory productId,
        address newOwner,
        string memory transferConditions
    )
        public
        nonReentrant
        productExists(productId)
        isProductOwner(productId)
        returns (bool)
    {
        address currentOwner = products[productId].currentOwner;

        // Update product owner
        products[productId].currentOwner = newOwner;

        // Update status based on recipient
        if (hasRole(SELLER_ROLE, newOwner)) {
            products[productId].status = ProductStatus.WithSeller;
        } else if (!hasRole(MANUFACTURER_ROLE, newOwner)) {
            products[productId].status = ProductStatus.Sold;
        } else {
            products[productId].status = ProductStatus.InTransit;
        }

        // Record transfer in history
        transferHistory[productId].push(
            Transfer({
                from: currentOwner,
                to: newOwner,
                timestamp: block.timestamp,
                transferConditions: transferConditions
            })
        );

        // Update ownership records
        // Remove from current owner's list
        removeFromOwnedProducts(currentOwner, productId);

        // Add to new owner's list
        productsOwned[newOwner].push(productId);

        emit OwnershipTransferred(productId, currentOwner, newOwner);
        return true;
    }

    /**
     * @dev Verify a product's authenticity
     */
    function verifyProduct(
        string memory productId,
        string memory location
    ) public productExists(productId) returns (bool) {
        bool isAuthentic = products[productId].isAuthentic;

        verificationHistory[productId].push(
            Verification({
                verifier: msg.sender,
                timestamp: block.timestamp,
                location: location,
                result: isAuthentic
            })
        );

        emit ProductVerified(productId, msg.sender, isAuthentic);
        return isAuthentic;
    }

    /**
     * @dev Report a counterfeit product
     */
    function reportCounterfeit(
        string memory productId,
        string memory evidenceHash,
        string memory description,
        string memory location
    ) public productExists(productId) returns (bool) {
        counterfeitReports[productId].push(
            CounterfeitReport({
                reporter: msg.sender,
                timestamp: block.timestamp,
                evidenceHash: evidenceHash,
                description: description,
                location: location,
                resolved: false
            })
        );

        emit CounterfeitReported(productId, msg.sender);
        return true;
    }

    /**
     * @dev Get product details
     */
    function getProductDetails(
        string memory productId
    )
        public
        view
        productExists(productId)
        returns (
            string memory, // productId
            address, // manufacturer
            address, // currentOwner
            uint256, // manufactureDate
            string memory, // manufacturerName
            string memory, // productDetails
            string memory, // manufacturingLocation
            ProductStatus, // status
            bool // isAuthentic
        )
    {
        Product memory product = products[productId];
        return (
            product.productId,
            product.manufacturer,
            product.currentOwner,
            product.manufactureDate,
            product.manufacturerName,
            product.productDetails,
            product.manufacturingLocation,
            product.status,
            product.isAuthentic
        );
    }

    /**
     * @dev Get transfer history for a product
     */
    function getTransferHistory(
        string memory productId
    ) public view productExists(productId) returns (Transfer[] memory) {
        return transferHistory[productId];
    }

    /**
     * @dev Get verification history for a product
     */
    function getVerificationHistory(
        string memory productId
    ) public view productExists(productId) returns (Verification[] memory) {
        return verificationHistory[productId];
    }

    /**
     * @dev Get products owned by an address
     */
    function getProductsOwned(
        address owner
    ) public view returns (string[] memory) {
        return productsOwned[owner];
    }

    /**
     * @dev Get products manufactured by an address
     */
    function getProductsManufactured(
        address manufacturer
    ) public view returns (string[] memory) {
        return productsManufactured[manufacturer];
    }

    /**
     * @dev Remove a product from the owner's list of owned products
     */
    function removeFromOwnedProducts(
        address owner,
        string memory productId
    ) internal {
        string[] storage owned = productsOwned[owner];
        for (uint i = 0; i < owned.length; i++) {
            if (keccak256(bytes(owned[i])) == keccak256(bytes(productId))) {
                // Move the last element to the current position and pop the last element
                owned[i] = owned[owned.length - 1];
                owned.pop();
                break;
            }
        }
    }

    /**
     * @dev Check if an address has a specific role
     */
    function hasSpecificRole(
        bytes32 role,
        address account
    ) public view returns (bool) {
        return hasRole(role, account);
    }
}
