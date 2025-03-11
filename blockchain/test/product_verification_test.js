const ProductVerification = artifacts.require("ProductVerification");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("ProductVerification", accounts => {
    const [admin, manufacturer1, seller1, consumer1] = accounts;
    let instance;

    beforeEach(async () => {
        instance = await ProductVerification.new({ from: admin });

        // Give manufacturer role to manufacturer1
        const MANUFACTURER_ROLE = web3.utils.soliditySha3("MANUFACTURER_ROLE");
        await instance.grantRole(MANUFACTURER_ROLE, manufacturer1, { from: admin });
    });

    describe("Product Registration", () => {
        it("should allow a manufacturer to register a product", async () => {
            const productId = "PROD001";
            const manufacturerName = "Premium Timepieces Ltd.";
            const productDetails = "QmT7fzZ7K9s4kGrP3GZwsHPuzjV2uKqR3GxLNHeDtvP4d9"; // IPFS hash
            const location = "Switzerland";

            const result = await instance.registerProduct(
                productId,
                manufacturerName,
                productDetails,
                location,
                { from: manufacturer1 }
            );

            expectEvent(result, 'ProductRegistered', {
                productId: productId,
                manufacturer: manufacturer1,
                manufacturerName: manufacturerName
            });

            // Verify the product was registered
            const productInfo = await instance.getProductDetails(productId);
            assert.equal(productInfo[0], productId, "Product ID doesn't match");
            assert.equal(productInfo[1], manufacturer1, "Manufacturer doesn't match");
            assert.equal(productInfo[4], manufacturerName, "Manufacturer name doesn't match");
        });

        it("should not allow non-manufacturers to register a product", async () => {
            const productId = "PROD002";

            await expectRevert(
                instance.registerProduct(
                    productId,
                    "Fake Company",
                    "details",
                    "location",
                    { from: consumer1 }
                ),
                "Caller is not a manufacturer"
            );
        });
    });

    describe("Seller Registration", () => {
        it("should allow a manufacturer to register a seller", async () => {
            // Important: Use admin instead of manufacturer1 to register the seller
            // Since admin has the DEFAULT_ADMIN_ROLE
            const result = await instance.registerSeller(seller1, { from: admin });

            expectEvent(result, 'SellerRegistered', {
                seller: seller1
            });

            // Verify the seller role
            const SELLER_ROLE = web3.utils.soliditySha3("SELLER_ROLE");
            const hasSeller = await instance.hasSpecificRole(SELLER_ROLE, seller1);
            assert.equal(hasSeller, true, "Seller role was not granted");
        });
    });

    describe("Product Ownership Transfer", () => {
        beforeEach(async () => {
            // Register a product first (by manufacturer1)
            await instance.registerProduct(
                "PROD003",
                "Premium Timepieces Ltd.",
                "QmT7fzZ7K9s4kGrP3GZwsHPuzjV2uKqR3GxLNHeDtvP4d9",
                "Switzerland",
                { from: manufacturer1 }
            );

            // Register seller (by admin)
            await instance.registerSeller(seller1, { from: admin });
        });

        it("should allow owner to transfer product ownership", async () => {
            const productId = "PROD003";
            const transferConditions = "Shipped via secure courier";

            const result = await instance.transferOwnership(
                productId,
                seller1,
                transferConditions,
                { from: manufacturer1 }
            );

            expectEvent(result, 'OwnershipTransferred', {
                productId: productId,
                from: manufacturer1,
                to: seller1
            });

            // Verify the new owner
            const productInfo = await instance.getProductDetails(productId);
            assert.equal(productInfo[2], seller1, "New owner doesn't match");
        });

        it("should not allow non-owners to transfer product ownership", async () => {
            const productId = "PROD003";

            await expectRevert(
                instance.transferOwnership(
                    productId,
                    consumer1,
                    "Invalid transfer",
                    { from: consumer1 }
                ),
                "Caller is not the product owner"
            );
        });
    });

    describe("Product Verification", () => {
        beforeEach(async () => {
            // Register a product first
            await instance.registerProduct(
                "PROD004",
                "Premium Timepieces Ltd.",
                "QmT7fzZ7K9s4kGrP3GZwsHPuzjV2uKqR3GxLNHeDtvP4d9",
                "Switzerland",
                { from: manufacturer1 }
            );
        });

        it("should allow anyone to verify a product", async () => {
            const productId = "PROD004";
            const location = "New York, USA";

            const result = await instance.verifyProduct(
                productId,
                location,
                { from: consumer1 }
            );

            expectEvent(result, 'ProductVerified', {
                productId: productId,
                verifier: consumer1,
                authentic: true
            });

            // Verify the verification was recorded
            const verifications = await instance.getVerificationHistory(productId);
            assert.equal(verifications.length, 1, "Verification was not recorded");
            assert.equal(verifications[0].verifier, consumer1, "Verifier doesn't match");
            assert.equal(verifications[0].location, location, "Location doesn't match");
        });
    });
});